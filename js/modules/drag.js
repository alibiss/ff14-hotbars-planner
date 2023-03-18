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

class ClonesList {
    constructor() {
        this.list = [];
    }

    create(event) {
        this.list.push( new ClonedAction(event.target) );

        return [...this.list].pop()
    }

    find(node) {
        return this.list.find(action => {
            if ( action.uid !== node.getAttribute("data-uid") ) return;
            return action;
        })
    }

    delete(node) {
        const index = this.list.indexOf(this.find(node));
        if ( index > -1 ) this.list.splice(index, 1); 
        node.remove();

        return true
    }
}

class ClonedAction {
    constructor(node) {
        // Init values
        this.el = node.cloneNode(true);
        this.uid = Math.random().toString(16).slice(2);
        this.offset = {};
        this.origin = null;

        // Apply styling and properties
        this.el.classList.replace("parent", "child");
        this.el.setAttribute("data-uid", this.uid);
        this.el.addEventListener("mousedown", initDragging, true);
    }

    update(cursor, node) {
        // Offset
        const abs = [cursor.target, document.body].map((el) => el.getBoundingClientRect());

        this.offset.x = abs[0].x - Math.abs(document.body.offsetLeft) - cursor.clientX;
        this.offset.y = abs[0].y - Math.abs(document.body.offsetTop) - cursor.clientY;

        // Origin
        this.origin = ( node.hasAttribute("data-slot") ? node : null );

        return {
            offset: { x: this.offset.x, y: this.offset.y },
            origin: this.origin
        }
    }

    replace(sibling) {
        sibling.parentNode.appendChild(this.el);

        if ( this.origin === null ) {
            // Dragged action from actions list
            DraggedActions.delete(sibling);
        } else {
            // Dragged action from hotbar
            this.origin.appendChild(sibling);
        }
    }

    clean() {
        this.el.removeAttribute("style");
        this.origin = null;
        this.offset = {};
    }
}

const DraggedActions = new ClonesList;

function initDragging(event) {
    if (event.button > 0) return; // Only M1 allowed

    let actionData;

    if ( this.classList.contains("parent") ) {
        actionData = DraggedActions.create(event)
    } else {
        actionData = DraggedActions.find(this)
    }

    // Keep info updated
    actionData.update(event, this.parentNode);

    // Prevent further cursor events from interferring with release
    actionData.el.style.pointerEvents = "none";

    // Initialize position before moving cursor
    actionData.el.style.position = "absolute";
    actionData.el.style.left = event.clientX + actionData.offset.x + "px";
    actionData.el.style.top = event.clientY + actionData.offset.y + "px";
    document.getElementById("dragged-item").appendChild(actionData.el);

    // Make dragged item follow the cursor
    window.addEventListener("mousemove", moveAction);
}

function moveAction(event) {
    const node = document.getElementById("dragged-item").lastChild;
    if ( node === null ) return;

    // Clear selection areas while moving cursor
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
    };

    const actionData = DraggedActions.find(node);
    actionData.el.style.left = (event.clientX + actionData.offset.x) + "px";
    actionData.el.style.top = (event.clientY + actionData.offset.y) + "px";
}

function releaseAction(event) {
    if (event.button > 0) return; // Only M1 allowed

    event.stopImmediatePropagation(); // !important

    const draggedAction = document.getElementById("dragged-item").lastChild;
    if ( draggedAction === null ) return;

    // Invalid release spot
    if ( this === window || this.hasAttribute("data-slot") === false ) {
        return DraggedActions.delete(draggedAction)
    };

    const actionData = DraggedActions.find(draggedAction);

    if ( this.children.length > 0 ) {
        // Populated slot
        actionData.replace(this.lastChild)
    } else {
        // Empty slot
        this.appendChild(actionData.el)
    }

    actionData.clean();
    window.removeEventListener("mousemove", moveAction);
}

export { DraggedActions, initDragging, releaseAction }
