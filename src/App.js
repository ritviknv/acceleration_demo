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
      background_image : background_0
    }
    this.handleMotion = this.handleMotion.bind(this)


  }
  componentDidMount(){
    window.addEventListener('devicemotion',this.handleMotion)

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
  total_accel(x, y, z){
    return Math.sqrt(x*x+y*y+z*z)
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
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src ={logo} className = "App-logo"></img> */}
          <img src={this.state.background_image} className="Background-Image" alt="logo" />
        </header>
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
