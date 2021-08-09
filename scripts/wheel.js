const canvas = document.getElementById("new-wheel")
const ctx = canvas.getContext("2d")
const inputArea = document.querySelector("#inputs")
const winnerScreen = document.querySelector(".winner-screen")
const winnerText = document.querySelector("#winner-text")
const volumeButton = document.getElementById("volumeControl")

const regex = /\d+\%$/
let audios = []
let a = 0 // Variable that tracks the audio "clicks" of the wheel

/* --- Tuning --- */
const colors = ["lightgray", "orange", "limegreen", "lightblue", "pink"]
let volumeOn = true
let friction = 0.99

/* --- Canvas Setup --- */
ctx.translate(canvas.width / 2, canvas.height / 2)
ctx.font = "50px sans-serif"
ctx.textBaseline = "middle"
ctx.textAlign = "right"

/* --- Init --- */
document.addEventListener("DOMContentLoaded", () => {init()})

function init(){
  winnerScreen.addEventListener("click", () => winnerScreen.style.display = "none")
  volumeButton.addEventListener("click", ()=> {
    volumeOn = !volumeOn
    volumeButton.innerHTML = volumeOn ? "volume_up" : "volume_off"
  })
  canvas.addEventListener("click", () =>{
    if(!wheel.isSpinning){
      wheel.isSpinning = true
      wheel.speed = Math.random() * 30 + 50 //Wheel speed! 
      spin()
    }
  })
  addInputEvent()
  volumeButton.innerHTML = volumeOn ? "volume_up" : "volume_off"
}

/* --- Set up Audio -- */
for(let i = 0; i < 5; i++){
  let audio = new Audio("./audio/click.wav")
  audio.volume = 0.1
  audio.playbackRate = 1.2
  audio.preload = "auto"
  audios.push(audio)
}
/* --- Only way I could think to repeat the audio several times and get that clicky effect -- */
function playAudio(){
  if(volumeOn){
    for(let i = 0; i < audios.length; i++){
      if(audios[i].paused){
        audios[i].play()
        return
      }
    }
    return
  }
}

/* --- The wheel class --- */
class Wheel{
  constructor(){
    this.isSpinning = false
    this.size = 490
    this.rotation = 0
    this.speed = 0
    this.segments = []
    this.colors = colors
  }
  draw(){
    ctx.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2)
    ctx.rotate(-90 * Math.PI /180)
    ctx.rotate(this.rotation * Math.PI /180)
    
    /* Draw Segments */
    for(let i = 0; i < this.segments.length; i++){
      ctx.save()
      ctx.beginPath();
      ctx.fillStyle = this.colors[i % colors.length]
      ctx.strokeStyle = "black"
      ctx.lineWidth = 10
      ctx.rotate(this.segments[i].angle * Math.PI / 180)
      ctx.arc(0, 0, this.size, 0, this.segments[i].size * Math.PI / 180)
      ctx.lineTo(0,0)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      /* Text for each segment */
      ctx.fillStyle = "black"
      ctx.rotate((this.segments[i].size/2) * (Math.PI / 180))
      ctx.fillText(this.segments[i].text, this.size - 35, 0, this.size/1.3)
      
      ctx.restore()
    }
    
    /* Draw dashed outline on the wheel */
    ctx.beginPath()
    ctx.strokeStyle = "white"
    ctx.lineWidth = 12
    ctx.setLineDash([Math.PI * 2 * this.size / this.segments.length / 4, Math.PI * 2 * this.size / this.segments.length / 4])
    ctx.arc(0, 0, this.size, 0, Math.PI*2)
    ctx.stroke()
    
    /* Draw inner circle */
    ctx.beginPath()
    ctx.fillStyle = "white"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 10
    ctx.setLineDash([])
    ctx.arc(0, 0, this.size/7, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
  changeSegments(inputs){
    this.segments = []
    this.segments = inputs
    a = wheel.segments.length - 1 //Update the sound tracker variable
    
  }
}

/* --- Set up Wheel -- */
let wheel = new Wheel();
wheel.changeSegments([{text: "EAT",angle: 0,size: 90},{text: "SLEEP",angle: 90,size: 90},{text: "SHOWER",angle: 180,size: 90},{text: "CHORES",angle: 270,size: 90}])
wheel.draw()


function spin(){
  if(wheel.isSpinning){
    wheel.speed *= friction
    wheel.rotation += wheel.speed
    if(wheel.speed <= 0.01){ //If the speed is low enough, let's just stop it
      wheel.isSpinning = false
      let winningAngle = 360 - wheel.rotation % 360
      for(let i = 0; i < wheel.segments.length; i++){
        if(i == wheel.segments.length - 1){
          win(wheel.segments[wheel.segments.length - 1].text)
          console.log("Winner: " + wheel.segments[wheel.segments.length - 1].text)
          return
        }
        if(winningAngle < wheel.segments[i+1].angle){
          win(wheel.segments[i].text)
          console.log("Winner: " + wheel.segments[i].text)
          return
        }
      }
      return
    }
    /* -- Audio -- */ /* This was so difficult to get right - Looping through the segments backwards*/
    if(a == 0){
      if(360 - (wheel.rotation) % 360 >= wheel.segments[wheel.segments.length - 1].angle){
        a = wheel.segments.length - 1
        if(volumeOn){
          playAudio()
        }
      }
    }else{
      if(360 - (wheel.rotation) % 360 <= wheel.segments[(a % wheel.segments.length)].angle){
        a--
        if(volumeOn){
          playAudio()
        }
      }
    }
    wheel.draw()
    requestAnimationFrame(spin)
  }
}

function win(string){
  winnerScreen.style.display = "flex";
  winnerText.innerHTML = string;
}

function testForPercent(inputs){
  for(let i=0; i<inputs.length; i++){
    if(regex.test(inputs[i])){
      return true
    }
  }
  return false
}

function addInputEvent(){
inputArea.addEventListener("input", e =>{
  if(!wheel.isSpinning){
    let inputs = inputArea.value.split("\n")
    let segments = []
    if(testForPercent(inputs)){ // Check if there's a percent in one of the inputs
      let knownSizes = []
      let unknownSizes = 0
      let totalSize = 0
      for(let i = 0; i < inputs.length; i++){ //Loop through all inputs to check for percents
        let size;
        if(regex.test(inputs[i])){ // If there's a percent
          size = 360 * parseInt(inputs[i].match(regex)[0].replace(/%$/, "")) / 100 //Calculate its size with it
          inputs[i] = inputs[i].replace(regex, "") //Remove the percent from the text string so the text on the wheel is clean
          totalSize += size //Add all the input's sizes that have percent to this variable, to calculate the inputs with no defined sized
        }else{
          size = undefined //Unknown size
          unknownSizes++ //Add to this variable to calculate undefined sizes
        }
        knownSizes.push(size) //Make a list of all the sizes, known and unknown
      }
      let size = (360 - totalSize) / unknownSizes //Calculate the size of the remaining inputs
      for(let i = 0; i < inputs.length; i++){ //Loop though all items again to create the segments objects
        let angle = 0
        for(let j = 0; j < segments.length; j++){ //Calculate the segment starting angle by adding all the previous sizes
          angle += segments[j].size
        }
        segments.push({
          text: inputs[i],
          size: knownSizes[i] != undefined ? knownSizes[i] : size, //Push either the known size or the calculated size for unknown inputs
          angle: angle
        })
      }
    }else{

      /* --- If there's no percentage, add segments with calculated angles and sizes to the wheel --- */
      let segmentSize = 360 / inputs.length
      for(let i = 0; i < inputs.length; i++){
        segments.push({text: inputs[i], angle: segmentSize * i, size: segmentSize})
      }
    }
    /* --- Upda wheel with new segments --- */
    wheel.changeSegments(segments)
    wheel.draw()
  }
})
}