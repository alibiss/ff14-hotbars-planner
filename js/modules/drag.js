// onclick          The user clicks on an element
// oncontextmenu    The user right-clicks on an element
// ondblclick       The user double-clicks on an element
// onmousedown      A mouse button is pressed over an element
// onmouseenter     The pointer is moved onto an element
// onmouseleave     The pointer is moved out of an element
// onmousemove      The pointer is moving over an element
// onmouseout       The mouse pointer moves out of an element
// onmouseover      The mouse pointer is moved over an element
// onmouseup        The mouse button is released over an element

class HotbarsList {
    constructor(selector) {
        this.el = document.querySelector(selector);
    }

    get list() {
        return this.el.children
    }

    create() {
        try {
            if ( this.list.length > 9 ) throw "Max number of hotbars reached.";

            const newHotbar = document.createElement("div");
            newHotbar.classList.add("hotbar");
            this.el.appendChild(newHotbar);
            for (let i=0; i<12; i++) {
                newHotbar.innerHTML += `<div data-slot="${i+1}"></div>`;
            }
        } catch(err) {
            console.error(err);
        }
    }

    delete(n) {
        try {
            this.list.find((_h, i) => i+1 == n).remove()
        } catch(err) {
            console.error(err);
        }
    }
}

class DraggedActions {
    constructor() {
        this.list = [];
    }

    create(event) {
        this.list.push( new PlacedAction(event.target) );
    }

    find(uid) {
        // document.getElementById("dragged-item").lastChild;
        return this.list.find(action => {
            if ( action.uid !== uid ) return;
            return action;
        })
    }
}

class PlacedAction {
    constructor(node) {
        this.el = node.cloneNode(true);
        this.uid = Math.random().toString(16).slice(2);
        this.el.classList.replace("parent", "child");
        this.el.setAttribute("data-uuid", this.uid);
        this.el.addEventListener("mousedown", startDrag, true);
    }
}

class DraggedAction {
    move(cursor) {
        clearSelection();
        this.el.style.left = (cursor.clientX + this.offset.x) + "px";
        this.el.style.top = (cursor.clientY + this.offset.y) + "px";
    }

    swap(sibling) {
        //console.debug("swap()");
        sibling.parentNode.appendChild(this.el);
        this.origin.appendChild(sibling);
    }

    replace(sibling) {
        //console.debug("replace()");
        sibling.parentNode.appendChild(this.el);
        findItem(sibling).delete();
    }

    clean() {
        //console.debug("clean()");
        this.el.removeAttribute("style");
        delete this.origin;
        delete this.offset;
        window.removeEventListener("mousemove", moveItem);
    }

    delete() {
        //console.debug("delete()");
        const index = parentOffspring.indexOf(findItem(this.node));
        if ( index > -1 ) parentOffspring.splice(index, 1);
        this.node.remove();
        window.removeEventListener("mousemove", moveItem);
    }
}

function initDragging(event) {
    if (event.button > 0) return; // Only M1 allowed

    const clickedElement = event.target;

    if ( clickedElement.classList.contains("parent") ) {

    }

    // Make dragged item follow the cursor
    window.addEventListener("mousemove", moveItem);
}

export { HotbarsList, DraggedAction }