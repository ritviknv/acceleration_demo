import React, { Component } from 'react';
import logo from './logo.svg';
import background_0 from './background.png';
import background_1 from './background_1.png';
import background_2 from './background_2.png';
import './App.css';
import keys from './keys.json'

// window.addEventListener("deviceorientation", handleOrientation, true);
var states = ['coasting', 'accelerating_aggressively', 'hard_braking']
var image_key = {
  "coasting":background_0,
  "accelerating_aggressively" :background_1,
  "hard_braking" :background_2,
}
var io = require('socket.io-client')
const stream_url = 'https://stream.automatic.com?token='+keys['client_id']+':'+keys['client_secret']
var socket = io(stream_url)
const time_0 = Math.round(new Date())
const integration_domain = 15
var time_array =[]
var accel_array = []
var ticker = 0


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      x :0,
      y    :0,
      z     :0,
      velocity :0, 
      t0: new Date(),
      driving_state: states[1],
      background_image : background_0,
      show_debugger: false,
      button_name: "Show Debugger",
      image_visibility: "visible",
      absolute: 0,
      alpha: 0,
      beta: 0,
      gamma: 0, 
      event: "None",
    }
    this.handleMotion = this.handleMotion.bind(this)
    this.handleOrientation = this.handleOrientation.bind(this)
    this.handleDebugger = this.handleDebugger.bind(this);
    this.handleCarEvent = this.handleCarEvent.bind(this);
    socket.on('connect', event => this.handleCarEvent(event, "Connected! Listening for events"))
  }
  componentDidMount(){
    window.addEventListener('devicemotion',this.handleMotion)
    window.addEventListener('deviceorientation',this.handleOrientation)
    socket.on('location:updated', eventJSON => this.handleCarEvent(eventJSON, "Location Updated!"))
    socket.on('error', errorMessage => this.handleCarEvent(errorMessage, errorMessage))
  }
  handleMotion(event){
    const x = event.acceleration.x.toFixed(1)
    const y = event.acceleration.y.toFixed(1)
    const z = event.acceleration.z.toFixed(1)
    var accel = this.total_accel(x,y,z)
    var current_time = Math.round(new Date())
    this.collect_data(accel, current_time)
    var state = this.read_image(accel)
    if (state != this.state.driving_state){
      this.setState({
        background_image: image_key[state],
        x:x,
        y:y,
        z:z,
        driving_state: state
      });
    }
  }
  handleOrientation(event){
    // const abs = event.absolute.toFixed(1)
    const alpha = event.alpha.toFixed(1)
    const beta = event.beta.toFixed(1)
    const gamma = event.gamma.toFixed(1)
    this.setState({
      absolute: event.absolute,
      alpha: alpha,
      beta: beta,
      gamma: gamma
    })
  }
  handleCarEvent(event, value){
    this.setState({
      event: value
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
    var direction = 1.0
    if (z>0 || y<0){
      direction = -1.0
    }
    var accel = direction*Math.sqrt(x*x+y*y+z*z)
    return accel
  }
  collect_data(accel,time){
    time_array.push(time)
    accel_array.push(accel)
    ticker++
    if (ticker > integration_domain) {
      time_array.shift()
      accel_array.shift()
      var time_a = time_array[0]
      ticker = 0
      var integral_velocity = this.integrate(accel_array, time_array)
      this.set_velocity(this.state.velocity+integral_velocity)
    }
  }
  set_velocity (newVelocity){
    this.setState({
      velocity: newVelocity
    })
  }
  integrate(accel_array, time_array){
    var velocity = 0
    for (var i = 0; i<time_array.length-1; i++){
      var diff = time_array[i+1]-time_array[i]
      velocity+= diff * (accel_array[i]+accel_array[i+1])/2
    }
    return velocity
  }
  read_image(accel){
    //basically if you're hard braking, the state will change. But to smoothen changes, we only make changes if you slow down or speed up significantly
    var state_change_threshold = 0.1
    var hard_braking_top = 4
    var hard_braking_bottom = hard_braking_top * (1-state_change_threshold)

    var speed_top = 1.5
    var speed_bottom = hard_braking_top * (1-state_change_threshold)
    if (accel>=hard_braking_top) {
      //you are braking big time
      return states[2]
    }
    else if (accel>=speed_top || (this.state.driving_state == states[2] && accel<=(hard_braking_bottom))){
      //not so chill state
      return states[1]
    }
    else if (accel<speed_top || (this.state.driving_state == states[1] && accel<=speed_bottom)){
      //chill state
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
      fontSize: "8px"
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
            {/* <header className="App-header"> */}
              {/* <img src ={logo} className = "App-logo"></img> */}
              <div className = "container">
                <button type = "Button" onClick = {this.handleDebugger} className = "btn" style={button_style}>{this.state.button_name}</button>
                <img src={this.state.background_image} className="Background-Image" alt="logo" style = {image_style}/>
                <div className = "Debugger" style = {style}>
                  <div >
                    <br></br>
                    <b>Acceleration</b><br/>
                    <div class="row">
                      <div class = "col-sm-4">
                        a_x: {this.state.x}
                      </div>
                      <div class = "col-sm-4">
                        a_y: {this.state.y}
                      </div>
                      <div class = "col-sm-4">
                        a_z: {this.state.z}
                      </div>
                    </div>
                    <br />
                    <b>Device Rotation</b><br/>
                    <div class="row">
                      <div class = "col-sm-4">
                        alpha: {this.state.alpha}
                      </div>
                      <div class = "col-sm-4">
                        beta: {this.state.beta}
                      </div>
                      <div class = "col-sm-4">
                        gamma: {this.state.gamma}
                      </div>
                    </div>
                    <br/>
                    <b>Vehicle Events</b><br/>
                    <div class="row">
                      <div class = "col-sm-4">
                        event: {this.state.event}
                      </div>
                      <div class = "col-sm-4">
                        velocity: {this.state.velocity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            {/* </header> */}
          </div>
      </div>   
    );
  }
}
export default App;
