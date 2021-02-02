export class Section {
    private readonly node:HTMLElement
    readonly image:HTMLImageElement

    constructor(mainNode:HTMLElement) {
        this.node = mainNode

        const node = this.node.querySelector("img")
        if(!node) {
            throw new Error(`No node by selector "img" in section`)
        }
        this.image = node
    }

    get points():[[number, number],[number, number]] {
        const area = this.node.dataset.area
        if(!area) return [[0,0],[0,0]]
        const[x1,y1,x2,y2] = area.split(",").map(char => Number.parseInt(char) || 0)
        return [[x1,y1],[x2,y2]]
    }

}