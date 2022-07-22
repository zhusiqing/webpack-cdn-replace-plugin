import './1.css'
import './2.css'
import Png from './1.png'
import Jpg from './1.jpeg'

const img = document.createElement('img')
img.src = Png

const div = document.createElement('div')
div.style.background = `url(${Jpg})`
