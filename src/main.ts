import {Section} from "./section"
//@ts-ignore
import transitions from "gl-transitions"
//@ts-ignore
import createTransition from "gl-transition"
//@ts-ignore
import createTexture2D from "gl-texture2d"

const CHANGE_SECTION_EVENT = "changeSection"

type Texture = any

type Transition = {
    draw: (progress:number, from:Texture, to:Texture, width:number, height:number, options:object) => void
}

class Figcaption extends EventTarget {
    private readonly linkNode:HTMLAnchorElement = document.createElement("a")
    readonly node = document.createElement("figcaption")
    private readonly section:Section

    constructor(section:Section, parent:HTMLElement) {
        super()
        this.initHTML()
        this.initEvents()
        this.initArea(section.points)
        parent.appendChild(this.node)

        this.section = section
    }

    private initHTML = () => {
        this.node.appendChild(this.linkNode)
        this.initIII()
    }

    private initEvents = () => {
        this.linkNode.addEventListener("click", this.onClick)
    }

    private readonly initArea = ([[x1, y1],[x2, y2]]:[[number, number],[number, number]]) => {
        this.node.style.setProperty("--x1", String(x1)+"px")
        this.node.style.setProperty("--y1", String(y1)+"px")
        this.node.style.setProperty("--x2", String(x2)+"px")
        this.node.style.setProperty("--y2", String(y2)+"px")
    }

    private readonly onClick = () => {
        const event = new CustomEvent<HTMLImageElement>(CHANGE_SECTION_EVENT, {detail:this.section.image})
        this.dispatchEvent(event)
    }

    initIII(col: number = 10) {
        function randomMinMax(min: number, max: number) {
            return Math.random() * (max - min) + min
          }
          
          function random() {
            return randomMinMax(-1.5, 1.5)
          }
          
         for (let i = 0; i < col; i++) {
            const div = document.createElement("span")
            div.classList.add("iii")
            const [sx, sy] = [random(), random()]
            div.style.setProperty("--start-x", String(sx));
            div.style.setProperty("--start-y", String(sy))
            const [x, y] = [random(), random()]
            div.style.setProperty("--translate-x", String(x))
            div.style.setProperty("--translate-y", String(y))
            const delay = Math.random()*3
            div.style.setProperty("--delay", String(delay))
            this.node.appendChild(div)
          }
    }
}

export class Main {
    static getNodeBySelector<T extends HTMLElement>(parent:HTMLElement, selector:string):T {
        const node = parent.querySelector<T>(selector)
        if(!node) {
            throw new Error(`No node by selector "${selector}" in main section`)
        }
        return node
    }

    static imageResize(image:HTMLImageElement, width:number, height:number) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const cont2d = canvas.getContext("2d");
        if(!cont2d) {
            throw new Error(`2d context creation error`)
        }
        const delta = width / image.naturalWidth
        const newHeight = image.naturalHeight * delta
        cont2d.drawImage(image, 0, 0, width, newHeight);
        return canvas;
    }

    private readonly node:HTMLElement
    private readonly figure:HTMLElement
    private areas:Array<Figcaption> = []
    private readonly canvas:HTMLCanvasElement
    private readonly image:HTMLImageElement
    private readonly gl:WebGLRenderingContext
    private readonly transition:Transition

    constructor(mainNode:HTMLElement) {
        this.node = mainNode

        this.figure = Main.getNodeBySelector<HTMLElement>(this.node, "figure")

        this.canvas = Main.getNodeBySelector<HTMLCanvasElement>(this.node, "canvas")

        this.image = Main.getNodeBySelector<HTMLImageElement>(this.figure, "img")

        this.gl = this.initWebGL()

        this.transition = this.initTransition("InvertedPageCurl")
    }

    addSection(section:Section) {
        const figcaption = new Figcaption(section, this.figure)
        figcaption.addEventListener(CHANGE_SECTION_EVENT, this.onChangeSection)
        this.areas = [...this.areas, figcaption]
    }

    get size() {
        const {width, height} = this.node.getBoundingClientRect()
        return [width, height]
    }

    private readonly onChangeSection = ((event:CustomEvent<HTMLImageElement>) => {
        const [width, height] = this.size
        const imageFrom = Main.imageResize(this.image, width, height)
        const imageTo = Main.imageResize(event.detail, width, height)

        const textureFrom = this.initTexture(imageFrom)
        const textureTo = this.initTexture(imageTo)

        this.renderTransition(textureFrom, textureTo, width, height).then()

    }) as EventListener

    private initWebGL() {
        const [width, height] = this.size
        this.canvas.width = width
        this.canvas.height = height

        const gl = this.canvas.getContext("webgl")
        if(!gl) {
            throw new Error(`WebGL context creation error`)
        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 4, 4, -1]), // a-big-triangle
        gl.STATIC_DRAW)
        gl.viewport(0, 0, width, height)
        return gl
    }

    private initTexture(image:HTMLImageElement | HTMLCanvasElement):Texture {
        const texture = createTexture2D(this.gl, image);
        texture.minFilter = this.gl.LINEAR;
        texture.magFilter = this.gl.LINEAR;
        return texture
    }

    private initTransition(name:string):Transition {
        return createTransition(this.gl, transitions.find((t:{name:string}) => t.name === name)); 
    }

    private renderTransition(from:Texture, to:Texture, width:number, height:number, duration: number = 3000) {
        return new Promise<void>((resolve, reject) => {
            let start:number | null = null;
            const loop = (timestamp:number) => {
                console.log(timestamp)
                if (!start) start = timestamp;
                let progress = timestamp - start;
                try {
                    const prg = 1 - (progress / duration % 1)
                    this.transition.draw(prg, to, from, width, height, {});
                }
                catch {
                    reject();
                }
                if (progress <= duration) {
                    requestAnimationFrame(loop);
                }
                else {
                    resolve();
                }
            };
            requestAnimationFrame(loop);
        })
    }
}