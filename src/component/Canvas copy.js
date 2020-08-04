import React, { Component } from 'react';
import ReactModal from 'react-modal';

export default class CanvasComponent extends Component {
  
  constructor(...args) {
    super(...args);
    this.state = {
      width: 500,
      height: 500,
      isEdit: false,
      oldLength: 0,
      value: 0,
      showModal: false,
      index: 0,
      angle: 0,
      showAngleModal: false,
      oldAngle: 0,
      angleIndex: 0
    };
    this.startX = 0;
    this.startY = 0;
    
    // this.mousedown = false;
    this.orderNumber = 0;
    this.points = [{}];
    this.arc = 0;
    this.length = 0;
    this.middlePoint = {};
  }
  componentDidMount() {
    this.canvas = this.refs.canvas;
    this.context = this.canvas.getContext('2d');
    this.context.lineWidth=3;
    this.context.strokeStyle="black";
    this.context.lineCap="round";
  }

  componentDidUpdate(prevProps, prevState) {
    this.canvas = this.refs.canvas;
    this.context = this.canvas.getContext('2d');
    this.context.lineWidth=3;
    this.context.strokeStyle="black";
    this.context.lineCap="round";
  }

  componentWillMount() {
    ReactModal.setAppElement('body');
  }

  handleInputChange = (e) => {
    this.setState({
      value: e.target.value
    })
  }

  handleAngleChange = (e) => {
    this.setState({
      angle: e.target.value
    })
  }

  clear() {
    this.refs.canvas.getContext('2d').clearRect(0, 0, this.state.width, this.state.height);
  }

  /* canvas mouse down event */
  startLine(e) {
    var x, y, isADotInLine=false;
    var num = 0;
    this.context.beginPath();
    this.startX = x = (e.pageX - this.canvas.offsetLeft); // coordinate x point of mouse down
    this.startY = y = (e.pageY - this.canvas.offsetTop); // coordinate y point of mouse down
    // this.mousedown = true;

    if(!this.state.isEdit)
    {
      this.points[this.orderNumber] = { x :this.startX, y: this.startY }; // save mouse down point in points object array
      this.orderNumber = this.orderNumber + 1; // points array index + 1
      this.drawLine(); // draw lines between points in points array
    }
    else {
      for(var i=1; i<this.points.length; i++)
      {
        if((Math.abs(x - this.points[i].x) < 3) && (Math.abs(y - this.points[i].y) < 3)) // if mouse down in a point
        {
          if(i != this.points.length-1) {
            for(var j=1; j<this.points.length; j++)
              if(j==i) { // point which is clicked
                this.drawDot(this.points[j], 'red');
              }
              else { // other points which is not clicked
                this.drawDot(this.points[j], 'yellow');
              }
          }
        }
        else {
          isADotInLine = this.isADotInLine(x,y,this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y); // if mouse down in a line
          if(isADotInLine) {
            this.drawSpecialLine(i); // draw line which is selected(clicked) again
          }
          else {
            num = num + 1; 
          }
        }
      }
    }
    if(num == this.points.length-1) { // if point is not clicked in a line
      this.drawSpecialLine(-1);
    }
  }

  // mouseMove(e) {
  //   var x, y;
  //   this.context.beginPath();
  //   x = (e.pageX - this.canvas.offsetLeft); // coordinate x point of mouse down
  //   y = (e.pageY - this.canvas.offsetTop); // coordinate y point of mouse down
  //   console.log(x,y)
  //   console.log(this.points)
  //   if(this.mousedown) {
  //     this.context.clearRect(0,0,this.state.width,this.state.height);
  //     this.context.beginPath();
  //     this.context.moveTo(this.points[this.points.length-1].x, this.points[this.points.length-1].y);
  //     this.context.lineTo(x,y);
  //     this.context.lineWidth=3;
  //     this.context.strokeStyle="black";
  //     this.context.lineCap="round";
  //   }
  // }

  // mouseUp(e) {
  //   this.mousedown = false;
  // }

  /* Draw line which is selected again */
  drawSpecialLine(index) {
    this.context.clearRect(0, 0, 1200, 700);
    for(var i=0; i<this.points.length; i++)
    {
      this.context.beginPath();
      this.drawDot(this.points[i], 'yellow');
        if(i > 0) {
          if(index == i)
          {            
            this.context.lineWidth=5;
            this.context.strokeStyle='green';
            this.context.moveTo(this.points[i-1].x, this.points[i-1].y);
            this.context.lineTo(this.points[i].x, this.points[i].y);        
          } else {
            this.context.lineWidth=3;
            this.context.strokeStyle="black";
            this.context.lineCap="round";
            this.context.moveTo(this.points[i-1].x, this.points[i-1].y);
            this.context.lineTo(this.points[i].x, this.points[i].y);
          }
            this.length = Math.round(this.getLength(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y)); // length between points
            this.middlePoint = this.getMiddlePoint(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y); // middle point of a line
            this.putText(this.length , this.middlePoint.x, this.middlePoint.y, 'red'); // write text in a middle point
            if(i >= 2) {
              this.arc = (this.getArc(this.points[i-2].x, this.points[i-2].y, this.points[i-1].x, this.points[i-1].y, this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y)).toFixed(1);
              this.putText(this.arc + "°", this.points[i-1].x, this.points[i-1].y, 'blue')
            }
          this.context.stroke();
          this.context.closePath();
        }                 
    }
  }

  // draw a line 
  drawLine(e) {
    this.context.clearRect(0, 0, 1200, 700);
    for(var i=0; i<this.points.length; i++)
    {
      this.context.beginPath();
      this.drawDot(this.points[i], 'yellow');
        if(i > 0) {
          this.context.moveTo(this.points[i-1].x, this.points[i-1].y);
          this.context.lineTo(this.points[i].x, this.points[i].y);
          this.length = Math.round(this.getLength(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y));
          this.middlePoint = this.getMiddlePoint(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y);
          this.putText(this.length , this.middlePoint.x, this.middlePoint.y, 'red');
          if(i >= 2) {
            this.arc = (this.getArc(this.points[i-2].x, this.points[i-2].y, this.points[i-1].x, this.points[i-1].y, this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y)).toFixed(1);
            this.putText(this.arc + "°", this.points[i-1].x, this.points[i-1].y, 'blue')
          }
          this.context.stroke();
          this.context.closePath();
        }                 
    }
  }

  /* draw a dot */
  drawDot(point, color) {
    this.context.beginPath();
    this.context.fillStyle = color;
    this.context.arc(point.x, point.y, 5, 0, Math.PI * 2);
    this.context.fill();
    this.context.closePath();
  }

  /* get lenth of two points */
  getLength(x1, y1, x2, y2){
      var a = x1 - x2;
      var b = y1 - y2;
      var c = Math.sqrt( a*a + b*b );
      return c;
  }

  /* get angle between two vectors */
  getArc(A1x, A1y, A2x, A2y, B1x, B1y, B2x, B2y) {
      var dAx = A2x - A1x;
      var dAy = A2y - A1y;
      var dBx = B2x - B1x;
      var dBy = B2y - B1y;
      var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
      if(angle < 0) {
        angle = angle * -1;
      }
      else {
        angle = 2 * Math.PI - angle;
      }

      var degree_angle = 180 - angle * (180 / Math.PI);
      if(degree_angle < 0) {
        degree_angle = degree_angle + 360;
      }
      return degree_angle;
  }

  /* get a middle point of a line */
  getMiddlePoint(x1, y1, x2, y2) {
      var a = x1 + x2;
      var b = y1 + y2;
      var middlePoint = {x: a/2, y: b/2};
      return middlePoint; 
  }

  /* write texts in a middle point of a line */
  putText(length, x1, y1, color) {
    this.context.font = "30px Arial";
    this.context.fillStyle = color;
    this.context.textAlign = "center";
    this.context.fillText(length, x1, y1);
  }

  /* mouse double click event */
  edit(e) {
    var x, y, isADotInLine=false;
    this.context.beginPath();
    x = (e.pageX - this.canvas.offsetLeft);
    y = (e.pageY - this.canvas.offsetTop);
    if(this.state.isEdit) {
      for(var i=1; i<this.points.length; i++)
      {
        if((Math.abs(x - this.points[i].x) < 3) && (Math.abs(y - this.points[i].y) < 3))
        {
          if(i!=this.points.length-1) {
            for(var j=1; j<this.points.length; j++)
              if(j==i) {
                this.drawDot(this.points[j], 'red');
                var arc = (this.getArc(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y, this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y)).toFixed(1);
                this.setState({
                  showAngleModal: true,
                  oldAngle: arc,
                  angle: arc,
                  angleIndex: i
                })
              }
              else {
                this.drawDot(this.points[j], 'yellow');
              }
          }
        }
        else {
          isADotInLine = this.isADotInLine(x,y,this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y);
          if(isADotInLine) {
            var length = Math.round(this.getLength(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y));
            this.setState({
              showModal: true,
              oldLength: length,
              value: length,
              index: i
            })
            this.drawSpecialLine(i);
          }
        }
      }
    }
  }

  /* if a point is in a line or not */
  isADotInLine(x,y,x1,y1,x2,y2) {
    return (Math.abs((y2-y1)/(x2-x1) - (y-y1)/(x-x1)) < 0.2) ? true : false;
  }

  /* return the point of delta with changed width of a line */
  resizePoints(oldLength, newLength, i) {
    var offX = Math.round((this.points[i].x-this.points[i-1].x)*newLength/oldLength);
    var offY = Math.round((this.points[i].y-this.points[i-1].y)*newLength/oldLength);
    return {x: offX, y: offY};
  }

  resizeAnglePoints(angle, index, i) {
    var cx = this.points[index].x;
    var cy = this.points[index].y;
    var x = this.points[i+1].x;
    var y =  this.points[i+1].y;

    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    this.points[i+1] = { x: nx, y: ny };
}

  /* draw button click event */
  draw() {
    this.setState({
      isEdit: !this.state.isEdit
    })
  }

  /* clear canvas */
  clearCanvas() {
    this.context.clearRect(0, 0, 1200, 700);
    this.points = [{}];
    this.orderNumber = 0;
    this.setState({
      isEdit: false
    })
  }

  /* ok button of changing model of length */
  handleChangeModal = () => {
    this.setState({
      showModal: false
    })
    const point = this.resizePoints(this.state.oldLength, this.state.oldLength - parseInt(this.state.value), this.state.index)

    for(var i=this.state.index; i<this.points.length; i++) {
      this.points[i] = { x: this.points[i].x - point.x, y: this.points[i].y - point.y };
    }
    this.drawLine();
  }

  /* cancel button of changing model of length */
  handleCloseModal = () => {
    this.setState({
      showModal: false
    })
  }

  /* ok button of changing model of angle */
  handleChangeAngleModal = () => {
    this.setState({
      showAngleModal: false
    })
    var oldAngle = this.state.oldAngle > 180 ? 180 - this.state.oldAngle : this.state.oldAngle
    for(var i=this.state.angleIndex; i<this.points.length-1; i++) {
      this.resizeAnglePoints(oldAngle - parseFloat(this.state.angle), this.state.angleIndex, i);
    }
    this.drawLine();
  }

  /* cancel button of changing model of angle */
  handleCloseAngleModal = () => {
    this.setState({
      showAngleModal: false
    })
  }

  // mouseover(e) {
  //   var x, y;
  //   x = (e.pageX - this.canvas.offsetLeft);
  //   y = (e.pageY - this.canvas.offsetTop);
  //   if(this.state.isEdit) {
  //   }
  // }
  
  // handleExport() {
  //   if (!this.points[0].x) {
  //     alert('please draw something and try again');
  //     return;
  //   }
  //   let data = JSON.stringify(this.points);
  //   let filename = 'example.json';
  //   var element = document.createElement('a');
  //   element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data));
  //   element.setAttribute('download', filename);
  //   element.style.display = 'none';
  //   document.body.appendChild(element);
  //   element.click();
  //   document.body.removeChild(element);
  //   console.log('done');
  // }
  // handleLoadExampleJson() {
  //   this.clear();
  //   // this.points = lineData;
  //   this.config.isEdit = true;
  //   this.forceUpdate();
  // }
  // handleLoadJson(e) {
  //   console.log(e.target.files[0])
  //   let reader = new FileReader();
  //   reader.readAsText(e.target.files[0]);
  //   reader.onload = (e) => console.log(this.result);
  // }

  // <script>
  // function resize(){    
  //   $("#canvas").outerHeight($(window).height()-$("#canvas").offset().top- Math.abs($("#canvas").outerHeight(true) - $("#canvas").outerHeight()));
  // }
  // $(document).ready(function(){
  //   resize();
  //   $(window).on("resize", function(){                      
  //       resize();
  //   });
  // });
  // </script>

  render() {
    return (
      <div className="canvasContainer">
        <button onClick={this.draw.bind(this)} className={this.state.isEdit ? 'edit' : 'draw'}>{this.state.isEdit ? 'Edit' : 'Draw'}</button>
        <button onClick={this.clearCanvas.bind(this)} className="clear">Clear</button>
        <ReactModal
          isOpen={this.state.showModal} 
          contentLabel="Input Value"
          className="modal"
        >
          <input type="text" onChange={this.handleInputChange} value={this.state.value} />
          <button onClick={this.handleChangeModal}>Ok</button>
          <button onClick={this.handleCloseModal}>Cancel</button>
        </ReactModal>
        <ReactModal
          isOpen={this.state.showAngleModal} 
          contentLabel="Input Value"
          className="modal"
        >
          <input type="text" onChange={this.handleAngleChange} value={this.state.angle} />
          <button onClick={this.handleChangeAngleModal}>Ok</button>
          <button onClick={this.handleCloseAngleModal}>Cancel</button>
        </ReactModal>
        {/* <canvas ref='canvas' id='drawingCanvas' width={this.state.width} height={this.state.height} onMouseDown={this.startLine.bind(this)} onDoubleClick={this.edit.bind(this)} onMouseMove={this.mouseMove.bind(this)} onMouseUp={this.mouseUp.bind(this)} /> */}
        <canvas ref='canvas' id='drawingCanvas' width={this.state.width} height={this.state.height} onMouseDown={this.startLine.bind(this)} onDoubleClick={this.edit.bind(this)} />

        {/* <button onClick={this.handleExport.bind(this)}> export as json</button>
        <button onClick={this.handleLoadExampleJson.bind(this)}> load example json file </button> */}
      </div>
    );
  }
}