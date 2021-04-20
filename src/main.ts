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
        const event = new CustomEvent<Section>(CHANGE_SECTION_EVENT, {detail:this.section})
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

    static imageResize(image:HTMLImageElement, width:number, height:number, top:number = 0, right:number = 0) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const cont2d = canvas.getContext("2d");
        if(!cont2d) {
            throw new Error(`2d context creation error`)
        }
        const imageWidth = width - right
        const delta = imageWidth / image.naturalWidth
        const newHeight = image.naturalHeight * delta
        cont2d.drawImage(image, 0, top, imageWidth, newHeight);
        return canvas;
    }

    private readonly node:HTMLElement
    private readonly figure:HTMLElement
    private areas:Array<Figcaption> = []
    private readonly canvas:HTMLCanvasElement
    private readonly image:HTMLImageElement
    private currentSection:any
    private readonly gl:WebGLRenderingContext
    private readonly transition:Transition
    private scrollFlag:boolean = false

    constructor(mainNode:HTMLElement) {
        this.node = mainNode

        this.figure = Main.getNodeBySelector<HTMLElement>(this.node, "figure")

        this.canvas = Main.getNodeBySelector<HTMLCanvasElement>(this.node, "canvas")

        this.image = Main.getNodeBySelector<HTMLImageElement>(this.figure, "img")

        this.gl = this.initWebGL()

        this.transition = this.initTransition("InvertedPageCurl")

        Main.getNodeBySelector<HTMLElement>(document.body, ".rmh-frame__close").addEventListener("click", this.onClose)

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

    private readonly onChangeSection = ((event:CustomEvent<Section>) => {
        const [width, height] = this.size
        const imageFrom = Main.imageResize(this.image, width, height)
        const imageTo = Main.imageResize(event.detail.image, width, height, 0, 107)

        const textureFrom = this.initTexture(imageFrom)
        const textureTo = this.initTexture(imageTo)
        if(event.currentTarget) {
            console.log(event.detail.node)
        }
        this.canvas.style.opacity = "100";
        this.currentSection = event.detail

        this.renderTransition(textureFrom, textureTo, width, height, 3000).then(this.afterTransition)

    }) as EventListener

    private readonly onClose = (() => {
        console.log(this.scrollTop)
        const [width, height] = this.size
        const imageTo = Main.imageResize(this.image, width, height)
        const imageFrom = Main.imageResize(this.currentSection.image, width, height, this.scrollTop * -1, 107)

        const textureFrom = this.initTexture(imageFrom)
        const textureTo = this.initTexture(imageTo)

        this.canvas.style.opacity = "100"
        document.body.classList.remove("section-mode")
        this.currentSection = null
        this.renderTransition(textureFrom, textureTo, width, height, 3000).then(this.afterTransition)

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

    get scrollTop():number {
        return document.body.querySelector("#rmh-content")!.scrollTop
    }

    set scrollTop(value:number) {
        document.body.querySelector("#rmh-content")!.scrollTop = value
    }
    
    private readonly startScroll = () => {
        console.log("scroll")
        this.scrollFlag = true;
    }

    private afterTransition = () => {
        this.canvas.style.opacity = "0"
 
        if(this.currentSection) {
            this.currentSection.node.style.display = "block"
            document.body.classList.add("section-mode")
            let progress:number = 0
            const loop = () => {
                progress = progress + 1
                this.scrollTop = progress

                if (progress < 3000 && !this.scrollFlag) {
                    requestAnimationFrame(loop);
                }
            };
            requestAnimationFrame(loop);

            window.addEventListener('pointerdown', this.startScroll);
        }
        else {
            document.querySelectorAll("section").forEach((item) => { item.style.display = "none" })
            window.removeEventListener('pointerdown', this.startScroll);
            this.scrollFlag = false;
        }
        
    }
}