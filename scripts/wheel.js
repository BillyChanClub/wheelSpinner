const inputArea = document.querySelector("#inputs")
const winnerScreen = document.querySelector(".winner-screen")
const winnerText = document.querySelector("#winner-text")
const colors = ["white", "red", "green", "blue", "blueviolet"]
const wheelTime = 10

let options = [["EAT", 72], ["SLEEP", 144], ["SHOWER", 216], ["CHORES", 288], ["GAMES", 360]]
let isSpinning = false
let winningAngle = 0

winnerScreen.addEventListener("click", () => winnerScreen.style.display = "none")

function spinTheWheel(){
  if(!isSpinning){
    playAudio(wheelTime)
    isSpinning = true;
    wheel.style.transform = `rotate(0deg)`
    wheel.style.transition = "none"
    winningAngle = Math.random() * 360
    setTimeout(()=>{
      wheel.style.transform = `rotate(${winningAngle + 360 * 10}deg)` 
      wheel.style.transition = `transform ${wheelTime}s cubic-bezier(.23,1,.32,1)`;
    },10)
    setTimeout(()=>{
      winnerScreen.style.display = "flex"
      isSpinning = false;
      let trueWinnerAngle = (360 - winningAngle) % 360
      //console.log(winningAngle, trueWinnerAngle)
      for(let i = 0; i < options.length; i++){
        if(trueWinnerAngle < options[i][1]){
          winnerText.innerHTML = options[i][0]
          console.log("Winner!: "+options[i][0])
          break;
        }
      }
    }, wheelTime * 1000)
  }
}


function addSpan(inputs, i, angle, size, prev){
  let span = document.createElement("span")
  span.innerHTML = inputs[i]
  angle /= 2
  angle += prev != undefined ? prev/2 : size/2*i /* If we get a previous size (from the formula that handles percents), use that instead */
  span.style.transform = `rotate(${angle}deg)`
  wheel.appendChild(span)
}

function addSeparator(angle){
  let el = document.createElement("div")
  el.classList.add("separator")
  angle = Math.round(angle)
  el.style.transform = `rotate(${angle}deg)`
  wheel.appendChild(el)
  //console.log("separator", angle)
}

function normalWheel(args){
  let inputs = args ? args : inputArea.value.split("\n")
  let size = 360 / inputs.length
  let gradientString = `conic-gradient( `
  options = []
  wheel.innerHTML = "";
  for(let i = 0; i < inputs.length; i++){
    let angle = (i+1)*size
    addSpan(inputs, i, angle, size)
    addSeparator(angle)
    let color = colors[i % colors.length]
    gradientString += `${color} ${angle-size}deg ${angle}deg`
    if(i != (inputs.length - 1)){
      gradientString += ", "
    }
    options.push([inputs[i], (i+1)*size])
  }
  
  gradientString += ")";
  //wheel.style["background-image"] = "conic-gradient(blue, red)"
  wheel.style["backgroundImage"] = gradientString;
}

inputArea.addEventListener("", e => {
  let inputs = inputArea.value.split("\n")
  let regex = /\d+\%$/
  if(inputs.length == 1) {inputs.push("")}
  if(testRegex(inputs, regex)){
    let knownSizes = []
    let unknownSizes = 0
    let totalSize = 0
    for(let i = 0; i < inputs.length; i++){
      let size;
      if(regex.test(inputs[i])){
        size = parseInt(inputs[i].match(regex)[0].replace(/%$/, ""))
        inputs[i] = inputs[i].replace(regex, "")
        totalSize += size
      }else{
        size = undefined
        unknownSizes++
      }
      knownSizes.push(size)
    }
    //console.log(knownSizes, unknownSizes, totalSize)
    
    /* ------------ */
    let size = (360 - (360 * totalSize / 100)) / unknownSizes
    wheel.innerHTML = "";
    let gradientString = `conic-gradient( `
    let addedSize = 0
    let spanAngles = []
    options = []
    for(let i = 0; i < inputs.length; i++){
      //addSpan(i, size, inputs)
      let color = colors[i % colors.length]
      let finalSize
      if(knownSizes[i] != undefined){
        finalSize =  ((360 * knownSizes[i] / 100)+addedSize)
        addSpan(inputs, i, finalSize, 0, addedSize)
        addedSize = finalSize
      }else{ 
        finalSize = size+addedSize
        addSpan(inputs, i, finalSize, 0, addedSize)
        addedSize = finalSize
      }
      addSeparator(finalSize)
      //console.log(finalSize+"deg")
      options.push([inputs[i], finalSize])
      gradientString += `${color} ${0}deg ${finalSize}deg`
      if(i != (inputs.length - 1)){
        gradientString += ", "
      }
    }
    
    gradientString += ")";
    //console.log(gradientString)
    wheel.style["backgroundImage"] = gradientString;
    
     /* ------------ */
  }else{ 
    normalWheel(inputs)
  }
})
/*
function testRegex(inputs, regex){
  for(let i = 0; i < inputs.length; i++){
    if(regex.test(inputs[i])){
      return true
    }
  }
  return false
}
*/
function testRegex(inputs, regex){
  return inputs.some((string) =>{
    return regex.test(string)
  })
}

let audios = []

for(let i = 0; i < 5; i++){
  let audio = new Audio("./audio/click.wav")
  audio.volume = 0.1
  audio.playbackRate = 1.2
  audio.preload = "auto"
  audios.push(audio)
}

function playAudio(){
  loopAudio()
}
function loopAudio(){
  if(volumeOn){
    for(let i = 0; i < audios.length; i++){
      if(audios[i].paused){
        audios[i].play()
        return
      }
    }
    return
  }
    //audioIndex++
    //audioIndex = audioIndex >= audios.length ? 0 : audioIndex
    /*
    audioTimer **= 1.03
    if(audioTimer < 630){
      setTimeout(loopAudio, audioTimer, audios)
    }
    */
}
let volumeOn = true
let volumeButton = document.getElementById("volumeControl")
volumeButton.addEventListener("click", (e)=> {
  volumeOn = !volumeOn
  volumeButton.innerHTML = volumeOn ? "volume_up" : "volume_off"
})



/* -------------------------------- New Code ---------------------------------------------------------------- */


const canvas = document.getElementById("new-wheel")
const ctx = canvas.getContext("2d")
ctx.translate(canvas.width / 2, canvas.height / 2)
ctx.font = "50px sans-serif"
ctx.textBaseline = "middle"
ctx.textAlign = "right"
console.log(ctx)

class Wheel{
  constructor(){
    this.isSpinning = false
    this.size = 490
    this.rotation = 0
    this.speed = 0
    this.segments = []
    this.colors = ["lightgray", "orange", "limegreen", "lightblue", "pink"]
    this.segmentSize = 360 / this.segments.length
  }
  draw(){
    this.rotation += this.speed
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
      ctx.rotate(this.segmentSize * i * Math.PI / 180)
      ctx.arc(0, 0, this.size, 0, this.segmentSize * Math.PI / 180)
      ctx.lineTo(0,0)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      /* Text for each segment */
      ctx.fillStyle = "black"
      ctx.rotate((this.segmentSize/2) * (Math.PI / 180))
      ctx.fillText(this.segments[i][0], this.size - 35, 0, this.size/1.3)
      ctx.restore()
    }
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
    this.segments = inputs
    this.segmentSize = 360 / this.segments.length
  }
}

let wheel = new Wheel();
wheel.changeSegments([["EAT", 0],["SLEEP", 90],["SHOWER", 180],["CHORES", 270]])
wheel.draw()

let a = 0

function spin(){
  if(wheel.isSpinning){
    wheel.speed *= 0.99
    //wheel.speed -= .1
    if(wheel.speed <= 0.03){
      wheel.isSpinning = false
      let winningAngle = 360 - wheel.rotation % 360
      for(let i = 0; i < wheel.segments.length; i++){
        if(i == wheel.segments.length - 1){
          win(wheel.segments[wheel.segments.length - 1][0])
          console.log("Winner: " + wheel.segments[wheel.segments.length - 1][0])
          return
        }
        if(winningAngle < wheel.segments[i+1][1]){
          win(wheel.segments[i][0])
          console.log("Winner: " + wheel.segments[i][0])
          return
        }
      }
      return
    }
    /* -- Audio -- */
    
    if(a == wheel.segments.length){
      if(360 - wheel.rotation % 360 >= wheel.segments[a-1][1]){
        a = 0
      }
    }else{
      if(wheel.rotation % 360 >= wheel.segments[a % wheel.segments.length][1]){
        a++
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
  setTimeout(()=>{
    winnerScreen.style.display = "flex";
    winnerText.innerHTML = string;
  }, 1000)
}

canvas.addEventListener("click", e =>{
  wheel.isSpinning = !wheel.isSpinning
  wheel.speed = Math.random() * 20 + 30
  spin()
})

inputArea.addEventListener("input", e =>{
  if(!wheel.isSpinning){
    let inputs = inputArea.value.split("\n")
    let segmentSize = 360 / inputs.length
    let segments = []
    for(let i = 0; i < inputs.length; i++){
      segments.push([inputs[i], segmentSize * i])
    }
    wheel.changeSegments(segments)
    wheel.draw()
  }
})