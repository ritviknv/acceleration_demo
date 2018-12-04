import React, { Component } from 'react';
import logo from './logo.svg';
import background_0 from './background.png';
import background_1 from './background_1.png';
import background_2 from './background_2.png';

import './App.css';
// window.addEventListener("deviceorientation", handleOrientation, true);
var states = ['coasting', 'accelerating_aggressively', 'hard_braking']
var image_key = {
  "coasting":background_0,
  "accelerating_aggressively" :background_1,
  "hard_braking" :background_2,
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      x :0,
      y    :0,
      z     :0,
      velocity :0, 
      t0: new Date(),
      driving_state: "flat", 
      background_image : background_0,
      show_debugger: false,
      button_name: "Show Debugger",
      image_visibility: "visible",
      absolute: 0,
      alpha: 0,
      beta: 0,
      gamma: 0
    }
    this.handleMotion = this.handleMotion.bind(this)
    this.handleOrientation = this.handleOrientation.bind(this)
    this.handleDebugger = this.handleDebugger.bind(this);

    this.debugger = (
      <div className = "App">
        <b>Acceleration</b><br/><div>
        a_x: <div className = "values">{this.state.x}</div><br/>
        </div>
        a_y: {this.state.y}<br/>
        a_z: {this.state.z}<br/>
        <br/>
        <b>Device Rotation</b><br/>
        alpha: {this.state.alpha}<br/>
        beta: {this.state.beta}<br/>
        gamma: {this.state.gamma}<br/>
      </div>
    )
  }
  componentDidMount(){
    window.addEventListener('devicemotion',this.handleMotion)
    window.addEventListener('deviceorientation',this.handleOrientation)
  }
  handleMotion(event){
    const x = event.acceleration.x
    const y = event.acceleration.y
    const z = event.acceleration.z
    var accel = this.total_accel(x,y,z)
    var state = this.read_image(accel)
    if (state != this.state.driving_state){
      this.setState({
        background_image: image_key[state]
      });
    }
  }
  handleOrientation(event){
    this.setState({
      absolute: event.absolute,
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    })
  }
  handleDebugger(event){
    if (this.state.show_debugger == false){
      this.setState({
        show_debugger: true,
        image_visibility: "hidden",
        button_name: "Hide Debugger"
      })
    }
    else {
      this.setState({
        show_debugger: false,
        image_visibility: "visible",
        button_name: "Show Debugger"
      })
    }
  }
  total_accel(x, y, z){
    var direction = 1.0;
    if (x<0){
      direction = -1.0;
    }
    return direction*Math.sqrt(x*x+y*y+z*z)
  }
  read_image(accel){
    // var hard_braking = -5.3936575
    // var hard_speed = 2.5
    var hard_braking = -0.2
    var hard_speed = 1.5
    if (accel<=hard_braking) {
      return states[2]
    }
    else if (accel>=hard_speed){
      return states[1]
    }
    else {
      return states[0]
    }
  }
  render() {
    var image_style = {
      visibility :this.state.image_visibility
    }
    var style = {
      zIndex: "10"
    }
    var button_style = {
      color: "grey",
      fontColor: "white"
    }
    if (!this.state.show_debugger) {
      style = {
        display:'none'
      }
    }
    return (
      <div>
        <meta name = "apple-mobile-web-app-capable" content="yes" />
          <div className="App">
            <header className="App-header">
              {/* <img src ={logo} className = "App-logo"></img> */}
              <div className = "container">
                <button type = "Button" onClick = {this.handleDebugger} className = "btn" >{this.state.button_name}</button>
                <img src={this.state.background_image} className="Background-Image" alt="logo" style = {image_style}/>
                <div className = "Debugger" style = {style}>
                  {this.debugger}
                </div>
              </div>
              
            </header>
          </div>
      </div>
      
    );
  }
}
function integrate(){
  var interval = 1
  
}
function live_feed(){
  var hard_braking = -5.3936575

}
function handleLocationError(message) {
  window.alert(message)
}
export default App;
