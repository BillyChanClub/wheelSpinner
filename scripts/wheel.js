const inputArea = document.querySelector("#inputs")
const wheel = document.getElementById("wheel")
const winnerScreen = document.querySelector(".winner-screen")
const winnerText = document.querySelector("#winner-text")
const colors = ["white", "red", "green", "blue", "blueviolet"]
const wheelTime = 10

let options = [["EAT", 72], ["SLEEP", 144], ["SHOWER", 216], ["CHORES", 288], ["GAMES", 360]]
let isSpinning = false
let winningAngle = 0

winnerScreen.addEventListener("click", () => winnerScreen.style.display = "none")
wheel.addEventListener("click", () => spinTheWheel())

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

inputArea.addEventListener("input", e => {
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

let audioTimer = 10
let audios = []
let audioIndex = 0
for(let i = 0; i < 10; i++){
  let audio = new Audio("./audio/click.wav")
  audio.volume = 0.2
  audio.playbackRate = 1.2
  audios.push(audio)
}

function playAudio(time){
  audioTimer = 1.02
  loopAudio(audios)
}
function loopAudio(audios){
  if(volumeOn){
    audios[audioIndex].play()
  }
    audioIndex++
    audioIndex = audioIndex >= audios.length ? 0 : audioIndex
    audioTimer **= 1.03
    if(audioTimer < 630){
      setTimeout(loopAudio, audioTimer, audios)
    }
}
let volumeOn = false
let volumeButton = document.getElementById("volumeControl")
volumeButton.addEventListener("click", (e)=> {
  volumeOn = !volumeOn
  volumeButton.innerHTML = volumeOn ? "volume_up" : "volume_off"
})

