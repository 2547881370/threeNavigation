class Arrow {
  constructor({ array, onMoveCallback }) {
    // 将传进来的数组转换为Vec3集合
    let pointsArr = [];
    for (let index = 0; index < array.length; index++) {
      pointsArr.push(
        new THREE.Vector3(array[index].x, array[index].z, array[index].y)
      );
    }

    // 顶点位置三维向量数组
    this.pointsArr = pointsArr;

    // 计算每个锚点在整条折线上所占的百分比
    this.pointPercentArr = [];
    {
      let distanceArr = []; // 每段距离
      let sumDistance = 0; // 总距离
      for (let index = 0; index < pointsArr.length - 1; index++) {
        distanceArr.push(pointsArr[index].distanceTo(pointsArr[index + 1]));
      }
      sumDistance = distanceArr.reduce(function (tmp, item) {
        return tmp + item;
      });

      let disPerSumArr = [0];
      disPerSumArr.push(distanceArr[0]);
      distanceArr.reduce(function (tmp, item) {
        disPerSumArr.push(tmp + item);
        return tmp + item;
      });

      disPerSumArr.forEach((value, index) => {
        disPerSumArr[index] = value / sumDistance;
      });
      this.pointPercentArr = disPerSumArr;
    }

    // 上一次的朝向
    this.preUp = this.pointsArr[0];

    // run函数需要的数据
    this.perce = 0; // 控制当前位置占整条线百分比
    this.speed = 0.0002; // 控制是否运动
    this.turnFactor = 0; // 暂停时间因子
    this.turnSpeedFactor = 0.001; // 转向速度因子
    this.obj = null;

    this.preTime = new Date().getTime();
    this.firstTurn = false;

    this._index = -1;
    this.onMoveCallback = onMoveCallback;
  }

  // 获取点，是否转弯，朝向等
  _getPoint(percent) {
    let indexP = 0;
    let indexN = 0;
    let turn = false;

    for (let i = 0; i < this.pointPercentArr.length; i++) {
      // 当前所在整条线的百分比在 路段之间时
      if (
        percent >= this.pointPercentArr[i] &&
        percent < this.pointPercentArr[i + 1]
      ) {
        indexN = i + 1;
        indexP = i;
        // 到了下一个转折点时，需要转向
        if (percent === this.pointPercentArr[i]) {
          turn = true;
        }
      }
    }

    // position 是计算当前所在的坐标位置
    // percent 当前最新位置在整个路径上的所占百分比
    // factor 是当前所在的路段中，所占的百分比
    let factor =
      (percent - this.pointPercentArr[indexP]) /
      (this.pointPercentArr[indexN] - this.pointPercentArr[indexP]);
    let position = new THREE.Vector3();
    position.lerpVectors(
      this.pointsArr[indexP],
      this.pointsArr[indexN],
      factor
    ); // position的计算完全正确
    // 计算朝向
    let up = new THREE.Vector3().subVectors(
      this.pointsArr[indexN],
      this.pointsArr[indexP]
    );
    let preUp = this.preUp;
    if (this.preUp.x != up.x || this.preUp.y != up.y || this.preUp.z != up.z) {
      // console.info('当前朝向与上次朝向不等，将turn置为true！')
      turn = true;
    }

    // 将当前最新朝向 ， 重新赋值给全局
    this.preUp = up;

    return {
      position,
      direction: up,
      turn, // 是否需要转向
      preUp, // 当需要转向时的上次的方向
    };
  }

  /**
   * @param {*} animata  是否运动
   * @param {*} mesh 运动的对象
   * @param {*} end 是否运动到结尾
   * @param {*} controls 如果运动对象是摄像机,则控制器要传入
   */
  run(animata, mesh, end, controls) {
    if (end) {
      this.perce = 0.99999;
      this.obj = this._getPoint(this.perce);

      // 修改位置
      let posi = this.obj.position;
      mesh.position.set(posi.x, posi.y, posi.z);
    } else if (animata) {
      // 转弯时
      if (this.obj && this.obj.turn) {
        // 百分比值自增长,用于计算向量线性插值
        if (this.turnFactor == 0) {
          this.preTime = new Date().getTime();
          this.turnFactor += 0.000000001;
        } else {
          let nowTime = new Date().getTime();
          let timePass = nowTime - this.preTime;
          this.preTime = nowTime;

          this.turnFactor += this.turnSpeedFactor * timePass;
        }

        if (this.turnFactor > 1) {
          // 转向完毕
          this.turnFactor = 0;
          this.perce += this.speed;

          this.obj = this._getPoint(this.perce);
          this._index += 1;
        } else {
          // 修改朝向 (向量线性插值方式)
          let interDirec = new THREE.Vector3();
          // this.turnFactor 会从大概0.1-1 正增长
          // this.obj.preUp 上一次的向量方向
          // this.obj.direction 当前最新的向量方向
          interDirec.lerpVectors(
            this.obj.preUp,
            this.obj.direction,
            this.turnFactor
          );

          let look = new THREE.Vector3();
          look = look.add(this.obj.position);
          look = look.add(interDirec);

          // cone.lookAt(look);
          mesh.lookAt(look); // 相机漫游1
        }
      }

      // 非转弯时
      else {
        this.obj = this._getPoint(this.perce);
        this.onMoveCallback &&
          this.onMoveCallback.call(this, {
            position: this.obj.position.clone(),
            direction : this.obj.direction.clone()
          });
        // 修改位置
        let posi = this.obj.position.clone();

        mesh.position.set(posi.x, posi.y, posi.z); // 相机漫游2

        // 当不需要转向时进行
        if (!this.obj.turn) {
          let look = posi.add(this.obj.direction.clone());

          mesh.lookAt(look); // 相机漫游3

          if (controls) {
            controls.target.x = posi.x;
            controls.target.y = posi.y;
            controls.target.z = posi.z;
          }
        }
        this.perce += this.speed;
      }
    }
  }
}
