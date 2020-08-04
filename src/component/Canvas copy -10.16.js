import React, { Component } from 'react';
import ReactModal from 'react-modal';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';

export default class CanvasComponent extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      width: props.isMobile ? window.innerWidth/1.3 : window.innerWidth/2.2,
      height: props.isMobile ? window.innerHeight/2.3 : window.innerHeight/2,
      isEdit: false,
      status: "draw",
      oldLength: 0,
      value: 0,
      showModal: false,
      index: 0,
      angle: 0,
      showAngleModal: false,
      oldAngle: 0,
      angleIndex: 0,
      selectedDot: -1,
      isFirstPoint: false
    };
    this.orderNumber = 0;
    this.points = props.points;
    this.arc = 0;
    this.length = 0;
    this.middlePoint = {};
    // lazy programmers globals
    this.scale = 1;
    this.wx    = 0; // world zoom origin
    this.wy    = 0;
    this.sx    = 0; // mouse screen pos
    this.sy    = 0;

    this.mouse = {};
    this.mouse.x   = 0; // pixel pos of mouse
    this.mouse.y   = 0;
    this.mouse.rx  = 0; // mouse real (world) pos
    this.mouse.ry  = 0;
    this.mouse.button = 0;
  }
  componentDidMount() {
    this.canvas = this.refs.canvas;
    this.context = this.canvas.getContext('2d');
    this.canvas.style.width = this.state.width;
    this.canvas.style.height = this.state.height;
    this.canvas.addEventListener('wheel', this.handleWheel);
    this.drawBackgroundLine();
    if(this.points.length > 1) {
      this.orderNumber = this.points.length;
      this.props.getPointInfo(this.getInfoByPoint(this.points));
      this.props.getPoints(this.points);
      this.drawLine();
    }
  }
  
  componentDidUpdate() {
    this.canvas = this.refs.canvas;
    this.context = this.canvas.getContext('2d');
  }
  
  componentWillMount() {
    ReactModal.setAppElement('body');
  }

  componentWillUnmount() {
    this.canvas.removeEventListener('wheel', this.handleWheel);
  }

  handleWheel = (e) => {
    e.preventDefault();
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

  handleChangeCheckBox = (e) => {
    this.setState({
      isFirstPoint: e.target.checked
    })
  }

  handleChangeRadio = (e) => {
    this.setState({
      status: e.target.value
    })
    this.state.status != "draw" ? this.setState({isEdit: false}) : this.setState({isEdit: true});
    this.drawLine();
  }

  mouseMove(e) {
    var x = e.pageX - this.canvas.offsetLeft; // coordinate x point of mouse down
    var y = e.pageY - this.canvas.offsetTop; // coordinate y point of mouse down
    if(this.state.isEdit) {
      this.mouse.x = x; 
      this.mouse.y = y;
      var xx = this.mouse.rx;
      var yy = this.mouse.ry;

      this.mouse.rx = this.zoomedX_INV(this.mouse.x);
      this.mouse.ry = this.zoomedY_INV(this.mouse.y);
      if (this.mouse.button === 1) { // is mouse button down 
        this.wx -= this.mouse.rx - xx; // move the world origin by the distance 
        // moved in world coords
        this.wy -= this.mouse.ry - yy;
        // recaculate mouse world 
        this.mouse.rx = this.zoomedX_INV(this.mouse.x);
        this.mouse.ry = this.zoomedY_INV(this.mouse.y);
        this.drawLine();
      }
    }
    // if(!this.state.isEdit) {
    else {
      if (this.mouse.button === 1) { // is mouse button down
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawLine();
        this.context.beginPath();
        if(this.state.isFirstPoint && this.points[0].x != undefined) {
          this.context.moveTo(this.zoomedX(this.points[0].x), this.zoomedY(this.points[0].y));
        }
        else {
          this.context.moveTo(this.zoomedX(this.points[this.points.length-1].x), this.zoomedY(this.points[this.points.length-1].y));
        }
        this.context.lineTo(x, y);

        var drawingLastPointIndex = this.state.isFirstPoint ? 1 : this.orderNumber; // last point index for drawing.

        //draw length
        if(this.orderNumber > 0) {
          this.length = Math.round(this.getLength(this.points[Math.abs(drawingLastPointIndex-1)].x, this.points[Math.abs(drawingLastPointIndex-1)].y, this.inverseZoomedX(x), this.inverseZoomedY(y)));
          this.middlePoint = this.getMiddlePoint(this.points[Math.abs(drawingLastPointIndex-1)].x, this.points[Math.abs(drawingLastPointIndex-1)].y, this.inverseZoomedX(x), this.inverseZoomedY(y));
          this.putText(this.length , this.zoomedX(this.middlePoint.x), this.zoomedY(this.middlePoint.y), 'red', 'length');
        }

        //draw angle
        if(this.orderNumber >= 2) {
            this.arc = (this.getArc(this.points[Math.abs(drawingLastPointIndex-2)].x, this.points[Math.abs(drawingLastPointIndex-2)].y, this.points[Math.abs(drawingLastPointIndex-1)].x, this.points[Math.abs(drawingLastPointIndex-1)].y, this.points[Math.abs(drawingLastPointIndex-1)].x, this.points[Math.abs(drawingLastPointIndex-1)].y, this.inverseZoomedX(x), this.inverseZoomedY(y))).toFixed(1);
            this.putText(this.arc, this.zoomedX(this.points[Math.abs(drawingLastPointIndex-1)].x), this.zoomedY(this.points[Math.abs(drawingLastPointIndex-1)].y), 'blue', 'angle')
          // this.drawAngle(drawingLastPointIndex);
        }

        this.context.strokeStyle = 'black';
        this.context.lineWidth = 3;
        this.context.lineJoin = this.context.lineCap = 'round';
        this.context.stroke();
      }
    }
  }

  mouseDown(e) {
    this.mouse.button = 1;
  }

  mouseUp(e) {
    var x, y, isADotInLine=false;
    var num = 0;
    this.mouse.button = 0;
    var isDotSelected = false;
    this.context.beginPath();
    x = this.inverseZoomedX(e.pageX - this.canvas.offsetLeft); // coordinate x point of mouse down
    y = this.inverseZoomedY(e.pageY - this.canvas.offsetTop); // coordinate y point of mouse down

    if(!this.state.isEdit) {
      this.addPoint(x, y);
      this.drawLine(); // draw lines between points in points array
    }
    else {
      for(var i=1; i<this.points.length; i++) {
        if((Math.abs(x - this.points[i].x) < 10) && (Math.abs(y - this.points[i].y) < 10)) { // if mouse down in a point
          isDotSelected = true;
          this.setState({
            selectedDot: i
          });
          for(var j=1; j<this.points.length; j++)
            if(j==i) { // point which is clicked
              this.drawDot(this.points[j], 'red');
            }
            else { // other points which is not clicked
              this.drawDot(this.points[j], 'yellow');
            }
        }
        else if(!isDotSelected) {
          isADotInLine = this.isADotInLine(x, y, this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y); // if mouse down in a line
          if(isADotInLine) {
            this.drawSelectedLine(i); // draw line which is selected(clicked) again
            this.setState({
              selectedDot: -1
            });
          }
          else {
            num = num + 1; 
          }
        }
      }
    }
    if(num == this.points.length-1) { // if a point is not clicked in a line
      this.setState({
        selectedDot: -1
      });
      this.drawSelectedLine(-1);
    }
  }

  /* mouse right click event */
  deletePoint() {
    if(this.state.selectedDot !=-1){
      this.points.splice(this.state.selectedDot, 1);
      this.setState({ selectedDot: -1 });
      if(this.points.length == 1) {
        this.points = [{}];    
        this.orderNumber = 0;
      }
      this.drawLine();
    }
    else {
      alert("A point is not selected.")
    }
    if(this.points.length > 1) {
      this.props.getPointInfo(this.getInfoByPoint(this.points));
      this.props.getPoints(this.points);
    }
  }

  /* get length and angle from points */
  getInfoByPoint(points) {
    var pointInfo = [{pointNo: 0, length:0, angle: 0}];
    pointInfo[0] = {pointNo: 0, length: Math.round(this.getLength(points[0].x, points[0].y, points[1].x, points[1].y)), angle: 0};
    for(var i=1; i<points.length-1; i++) {
      pointInfo[i] = {pointNo: i, length: Math.round(this.getLength(points[i].x, points[i].y, points[i+1].x, points[i+1].y)), angle:parseFloat(this.getArc(points[i-1].x, points[i-1].y, points[i].x, points[i].y, points[i].x, points[i].y, points[i+1].x, points[i+1].y).toFixed(1))};
    }
    return pointInfo;
  }

  /* set points by editing table(length and angle) */
  changePoint(value, index, type) {
    if(type == "length") {
      var length = Math.round(this.getLength(this.points[index].x, this.points[index].y, this.points[index+1].x, this.points[index+1].y));
      const point = this.resizePoints(length, length - value, index+1)

      for(var i=index+1; i<this.points.length; i++) {
        this.points[i] = { x: this.points[i].x - point.x, y: this.points[i].y - point.y };
      }
      this.drawLine();
    }
    if(type == "angle") {
      if(index !=0) {
        var arc = (this.getArc(this.points[index-1].x, this.points[index-1].y, this.points[index].x, this.points[index].y, this.points[index].x, this.points[index].y, this.points[index+1].x, this.points[index+1].y)).toFixed(1);
        var oldAngle = arc;
        value = value < 0 ? value + 360 : value;
        for(var i=index; i<this.points.length-1; i++) {
          this.resizeAnglePoints(oldAngle - value, index, i);
        }
        this.drawLine();
      }
    }
    if(this.points.length > 1) {
      this.props.getPointInfo(this.getInfoByPoint(this.points));
      this.props.getPoints(this.points);
    }
  }

  drawBackgroundLine() {
    this.context.lineWidth=1;
    this.context.strokeStyle='white';
    this.context.beginPath();
    for(var i=-10000; i<=10000; i=i+20) {
      this.context.moveTo(this.zoomedX(i), this.zoomedY(-10000));
      this.context.lineTo(this.zoomedX(i), this.zoomedY(10000));    
    }
    for(var j=-10000; j<=10000; j=j+20) {
      this.context.moveTo(this.zoomedX(-10000), this.zoomedY(j));
      this.context.lineTo(this.zoomedX(10000), this.zoomedY(j));
    }
    this.context.stroke();
    this.context.closePath();
  }

  zoomed(number) { // just scale
    return Math.floor(number * this.scale);
  }
  // converts from world coord to screen pixel coord
  zoomedX(number) { // scale & origin X
    return Math.floor((number - this.wx) * this.scale + this.sx);
  }

  inverseZoomedX(number) { // scale & origin X
    return Math.floor((number-this.sx)/this.scale + this.wx);
  }
  
  inverseZoomedY(number) { // scale & origin Y
    return Math.floor((number-this.sy)/this.scale + this.wy);
  }

  zoomedY(number) { // scale & origin Y
    return Math.floor((number - this.wy) * this.scale + this.sy);
  }

  // Inverse does the reverse of a calculation. Like (3 - 1) * 5 = 10   the inverse is 10 * (1/5) + 1 = 3
  // multiply become 1 over ie *5 becomes * 1/5  (or just /5)
  // Adds become subtracts and subtract become add.
  // and what is first become last and the other way round.

  // inverse function converts from screen pixel coord to world coord
  zoomedX_INV(number) { // scale & origin INV
    return Math.floor((number - this.sx) * (1 / this.scale) + this.wx);
    // or return Math.floor((number - sx) / scale + wx);
  }

  zoomedY_INV(number) { // scale & origin INV
    return Math.floor((number - this.sy) * (1 / this.scale) + this.wy);
    // or return Math.floor((number - sy) / scale + wy);
  }

  handleMouseWheel(e) {
    if (e.deltaY < 0) {
      this.scale = Math.min(5, this.scale * 1.1); // zoom in
    } else {
      this.scale = Math.max(0.1, this.scale * (1 / 1.1)); // zoom out is inverse of zoom in
    }
    this.wx = this.mouse.rx; // set world origin
    this.wy = this.mouse.ry;
    this.sx = this.mouse.x; // set screen origin
    this.sy = this.mouse.y;
    this.mouse.rx = this.zoomedX_INV(this.mouse.x); // recalc mouse world (real) pos
    this.mouse.ry = this.zoomedY_INV(this.mouse.y);
    this.drawLine();
  }

  zoomforMobile = (zoomType) => {
    var deltaY = zoomType === "in" ? -100 : 100;
    if (deltaY < 0) {
      this.scale = Math.min(5, this.scale * 1.1); // zoom in
    } else {
      this.scale = Math.max(0.1, this.scale * (1 / 1.1)); // zoom out is inverse of zoom in
    }
    this.wx = this.mouse.rx; // set world origin
    this.wy = this.mouse.ry;
    this.sx = this.mouse.x; // set screen origin
    this.sy = this.mouse.y;
    this.mouse.rx = this.zoomedX_INV(this.mouse.x); // recalc mouse world (real) pos
    this.mouse.ry = this.zoomedY_INV(this.mouse.y);
    this.drawLine();
  }

  addPoint(x, y) {
    var x = Math.round(x);
    var y = Math.round(y);

    if(this.state.isFirstPoint) {
      if(this.points[0].x != undefined)
      {
        var temp = Array.from(this.points);
        this.points[0] = {x: x, y: y};
        this.orderNumber = this.orderNumber + 1; // points array index + 1
        for(var i=1; i<=temp.length; i++) {
          this.points[i] = {x: temp[i-1].x, y: temp[i-1].y};
        }        
      }
    }
    else{
      this.points[this.orderNumber] = { x: x, y: y }; // save mouse down point in points object array
      this.orderNumber = this.orderNumber + 1; // points array index + 1
    }
    if(this.points.length > 1) {
      this.props.getPointInfo(this.getInfoByPoint(this.points));
      this.props.getPoints(this.points);
    }
  }
  /* Draw line which is selected again */
  drawSelectedLine(index) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgroundLine();
    for(var i=0; i<this.points.length; i++)
    {
      this.context.beginPath();
      this.drawDot(this.points[i], 'yellow');
        if(i > 0) {
          if(index == i)
          {            
            this.context.lineWidth=5;
            this.context.strokeStyle='green';
            this.context.moveTo(this.zoomedX(this.points[i-1].x), this.zoomedY(this.points[i-1].y));
            this.context.lineTo(this.zoomedX(this.points[i].x), this.zoomedY(this.points[i].y));        
          } else {
            this.context.lineWidth=3;
            this.context.strokeStyle="black";
            this.context.lineCap="round";
            this.context.moveTo(this.zoomedX(this.points[i-1].x), this.zoomedY(this.points[i-1].y));
            this.context.lineTo(this.zoomedX(this.points[i].x), this.zoomedY(this.points[i].y));
          }
            this.length = Math.round(this.getLength(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y)); // length between points
            this.middlePoint = this.getMiddlePoint(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y); // middle point of a line
            this.putText(this.length , this.zoomedX(this.middlePoint.x), this.zoomedY(this.middlePoint.y), 'red', 'length'); // write text in a middle point
            if(i >= 2) {
              this.drawAngle(i);
            }
          this.context.stroke();
          this.context.closePath();
        }                 
    }
  }

  // draw a line 
  drawLine(e) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgroundLine();

    this.context.lineWidth=3;
    this.context.strokeStyle="black";
    this.context.lineCap="round";
    for(var i=0; i<this.points.length; i++)
    {
      this.drawDot(this.points[i], 'yellow');
      this.context.beginPath();

      if(i > 0) {
        this.context.moveTo(this.zoomedX(this.points[i-1].x), this.zoomedY(this.points[i-1].y));
        this.context.lineTo(this.zoomedX(this.points[i].x), this.zoomedY(this.points[i].y));
        this.length = Math.round(this.getLength(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y));
        this.middlePoint = this.getMiddlePoint(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y);
        this.putText(this.length , this.zoomedX(this.middlePoint.x), this.zoomedY(this.middlePoint.y), 'red', 'length');
        if(i >= 2) {
          this.drawAngle(i);
        }
      }
      this.context.stroke();
      this.context.closePath();
    }
  }

  /* draw a dot */
  drawDot(point, color) {
    this.context.beginPath();
    this.context.fillStyle = color;
    this.context.arc(this.zoomedX(point.x), this.zoomedY(point.y), 5, 0, Math.PI * 2);
    this.context.fill();
    this.context.closePath();
  }

  drawAngle(i) {
    var direction = false;
    // calculate the angles in radians using Math.atan2
    var dx1=this.points[i-2].x-this.points[i-1].x;
    var dy1=this.points[i-2].y-this.points[i-1].y;
    var dx2=this.points[i].x-this.points[i-1].x;
    var dy2=this.points[i].y-this.points[i-1].y;
    var a1=Math.atan2(dy1,dx1);
    var a2=Math.atan2(dy2,dx2);
    this.arc = (this.getArc(this.points[i-2].x, this.points[i-2].y, this.points[i-1].x, this.points[i-1].y, this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y)).toFixed(1);
    direction = this.arc > 180 ? true : false;
    
    // draw angleSymbol using context.arc
    this.context.save();
    this.context.moveTo(this.zoomedX(this.points[i-1].x),this.zoomedY(this.points[i-1].y));
    this.context.arc(this.zoomedX(this.points[i-1].x),this.zoomedY(this.points[i-1].y),this.zoomed(20),a1,a2, direction);
    this.context.fillStyle="red";
    this.context.globalAlpha=0.25;
    this.context.fill();
    this.context.restore();

    // draw the degree angle in text
    this.putText(this.arc, this.zoomedX(this.points[i-1].x), this.arc > 180 ? this.zoomedY(this.points[i-1].y)-10 : this.zoomedY(this.points[i-1].y)+20, 'blue', 'angle');
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
  putText(value, x1, y1, color, type) {
    // this.context.font = this.zoomed(30)+"px Arial";
    this.context.fillStyle = color;
    this.context.textAlign = "center";
    if(type == "length") {
      this.context.font = "30px Arial";
      value = value;
    }
    else {
      this.context.font = "20px Arial";
      value = parseFloat(value) > 180 ? (360 - parseFloat(value)).toFixed(1) + "°" : value + "°";
    }
    this.context.fillText(value, x1, y1);
  }

  /* edit the length and arc */
  mouseDbl(e) {
    var x, y, isADotInLine=false;
    var isDotSelected = false;
    this.context.beginPath();
    x = this.inverseZoomedX(e.pageX - this.canvas.offsetLeft);
    y = this.inverseZoomedY(e.pageY - this.canvas.offsetTop);
    this.setState({
      selectedDot: -1
    });
    if(this.state.isEdit) {
      for(var i=1; i<this.points.length; i++)
      {
        if((Math.abs(x - this.points[i].x) < 10) && (Math.abs(y - this.points[i].y) < 10))
        {
          isDotSelected = true;
          if(i!=this.points.length-1) {
            for(var j=1; j<this.points.length; j++)
              if(j==i) {
                this.drawDot(this.points[j], 'red');
                var arc = (this.getArc(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y, this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y)).toFixed(1);
                this.setState({
                  showAngleModal: true,
                  oldAngle: parseFloat(arc) > 180 ? (parseFloat(arc) - 360).toFixed(1) : arc,
                  angle: parseFloat(arc) > 180 ? (parseFloat(arc) - 360).toFixed(1) : arc,
                  angleIndex: i
                })
              }
              else {
                this.drawDot(this.points[j], 'yellow');
              }
          }
        }
        else if(!isDotSelected) {
          isADotInLine = this.isADotInLine(x, y, this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y);
          if(isADotInLine) {
            var length = Math.round(this.getLength(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y));
            this.setState({
              showModal: true,
              oldLength: length,
              value: length,
              index: i
            })
            this.drawSelectedLine(i);
          }
        }
      }
    }
  }

  /* if a point is in a line or not */
  isADotInLine(x,y,x1,y1,x2,y2) {
    var rectX1 = Math.min(x1, x2);
    var rectY1 = Math.min(y1, y2);
    var rectX2 = Math.max(x1, x2);
    var rectY2 = Math.max(y1, y2);

    if(x > rectX1-50 && x < rectX2+50 && y > rectY1-50 && y < rectY2+50)
    {
      return (Math.abs((y2-y1)*(x-x1) - (y-y1)*(x2-x1)) < 2000) ? true : false;
    }
    else {
      return false;
    }
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

  /* get 2 left-top and right-bottom points in points array*/
  getRectofPoints(points) {
    var xMin, yMin, xMax, yMax;
    var xTemp = [], yTemp = [];
    var rect = {};
    for(var i=0; i<points.length; i++) {
      xTemp.push(points[i].x);
      yTemp.push(points[i].y);
    }
    xMin = Math.min(...xTemp);
    xMax = Math.max(...xTemp);
    yMin = Math.min(...yTemp);
    yMax = Math.max(...yTemp);
    var rect = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax}
    return rect;
  }

  /* clear canvas and reset all settings */
  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.points = [{}];
    this.orderNumber = 0;
    this.setState({
      selectedDot: -1,
      isEdit: false,
      status: 'draw',
      isFirstPoint: false
    });

    //clear points array
    this.props.getPointInfo([{}]);
    this.props.getPoints([{}]);

    // reset the zoom setting
    this.scale = 1;
    this.wx = 0; // world zoom origin
    this.wy = 0;
    this.sx = 0; // mouse screen pos
    this.sy = 0;

    this.mouse = {};
    this.mouse.x = 0; // pixel pos of mouse
    this.mouse.y = 0;
    this.mouse.rx = 0; // mouse real (world) pos
    this.mouse.ry = 0;
    this.mouse.button = 0;

    //redraw grid
    this.drawBackgroundLine();
  }

  /* Fit the lines to canvas */
  fitToScreen() {
    if(this.points.length > 1) {
      var rect = this.getRectofPoints(this.points);
      var rateX = 0, rateY = 0;
      this.wx = 0;
      this.wy = 0;
      rateX = (this.canvas.width-20)/(rect.xMax-rect.xMin);
      rateY = (this.canvas.height-20)/(rect.yMax-rect.yMin);
      if(rateX > rateY) {
        this.scale = 1 * rateY;
      }
      else {
        this.scale = 1 * rateX;
      }
      this.wx = (this.zoomedX(rect.xMin)-(this.canvas.width-this.zoomedX(rect.xMax)+this.zoomedX(rect.xMin))/2)/this.scale; // world zoom origin
      this.wy = (this.zoomedY(rect.yMin)-(this.canvas.height-this.zoomedY(rect.yMax)+this.zoomedY(rect.yMin))/2)/this.scale;
      this.drawLine();
    }
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
    if(this.points.length > 1) {
      this.props.getPointInfo(this.getInfoByPoint(this.points));
      this.props.getPoints(this.points);
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
    var oldAngle = parseFloat(this.state.oldAngle) < 0 ? parseFloat(this.state.oldAngle) + 360 : parseFloat(this.state.oldAngle);
    var newAngle = parseFloat(this.state.angle) < 0 ? parseFloat(this.state.angle) + 360 : parseFloat(this.state.angle);
    for(var i=this.state.angleIndex; i<this.points.length-1; i++) {
      this.resizeAnglePoints(oldAngle - newAngle, this.state.angleIndex, i);
    }
    if(this.points.length > 1) {
      this.props.getPointInfo(this.getInfoByPoint(this.points));
      this.props.getPoints(this.points);
    }
    this.drawLine();
  }

  /* cancel button of changing model of angle */
  handleCloseAngleModal = () => {
    this.setState({
      showAngleModal: false
    })
  }

  render() {
    return (
      <div className="canvasContainer">
        <RadioGroup aria-label="status" value={this.state.status} onChange={this.handleChangeRadio} className="status">
          <FormControlLabel value="draw" control={<Radio color="primary"/>} label="Draw" className="draw" />
          <FormControlLabel value="edit" control={<Radio color="secondary"/>} label="Edit" className="edit" />
        </RadioGroup>
        <Button variant="contained" onClick={this.clearCanvas.bind(this)} className="clear">Clear</Button>
        <Button variant="contained" color="primary" onClick={this.fitToScreen.bind(this)} className="fit-btn">Fit to Screen</Button>
        <Button variant="contained" onClick={this.deletePoint.bind(this)} className="delete">Delete a point</Button>
        <div className="checkboxContainer">
          <span>From the first point:</span>
          <Checkbox
            checked={this.state.isFirstPoint}
            onChange={this.handleChangeCheckBox}
            color="primary"
            inputProps={{
              'aria-label': 'secondary checkbox',
            }}
          />
          <ZoomInIcon className="zoom-icon" onClick={()=>this.zoomforMobile('in')} />
          <ZoomOutIcon className="zoom-icon" onClick={()=>this.zoomforMobile('out')} />
        </div>
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
        <canvas ref='canvas' id='drawingCanvas' width={this.state.width} height={this.state.height} onMouseUp={this.mouseUp.bind(this)} onMouseDown={this.mouseDown.bind(this)} onDoubleClick={this.mouseDbl.bind(this)} onMouseMove={this.mouseMove.bind(this)} onWheel={this.handleMouseWheel.bind(this)} />
      </div>
    );
  }
}