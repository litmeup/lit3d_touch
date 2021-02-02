import {Main} from "./main"
import {Section} from "./section"

void async function main() {
	// Init main node
	const mainNode = document.querySelector("main")
	if(!mainNode) {
		throw new Error("Main node is not found")
	}
	const main = new Main(mainNode)
	console.log(main)

	// Init sections node
	document.querySelectorAll("section").forEach(sectionNode => main.addSection(new Section(sectionNode)))
}()