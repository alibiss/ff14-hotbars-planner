(() => {
    "use strict";

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

    class draggedItem {
        constructor(e) {
            this.node = e.target.cloneNode(true);
            this.node.classList.replace("parent", "child");
            this.node.setAttribute("data-uuid", Math.random().toString(16).slice(2));
            this.node.addEventListener("mousedown", startDrag, true);
        }
        move(cursor) {
            clearSelection();
            this.node.style.left = (cursor.clientX + this.offset.x) + "px";
            this.node.style.top = (cursor.clientY + this.offset.y) + "px";
        }
        clean() {
            //console.debug("clean()");
            this.node.removeAttribute("style");
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
        swap(sibling) {
            //console.debug("swap()");
            sibling.parentNode.appendChild(this.node);
            this.origin.appendChild(sibling);
        }
        replace(sibling) {
            //console.debug("replace()");
            sibling.parentNode.appendChild(this.node);
            findItem(sibling).delete();
        }
    };

    // Store class results in here
    let parentOffspring = [];

    // 1. Make parents spawn a draggable clone
    const items = document.getElementById("actions").querySelectorAll(".item");
    items.forEach(item => item.addEventListener("mousedown", startDrag, true));

    // 2. Stop dragging when mouse button is released
    window.addEventListener("mouseup", releaseItem);
    const hotbars = document.querySelectorAll(".hotbars-container > div");
    hotbars.forEach((hotbar) => {
        const slots = hotbar.querySelectorAll("div");
        slots.forEach((slot) => {
            slot.addEventListener("mouseup", releaseItem, true)
        })
    });

    // Functions
    function startDrag(e) { // on mousedown
        // Ignore if button =/= M1
        if (e.button > 0) return;

        let action;
        if ( e.target.classList.contains("parent") ) {
            //console.debug(`Clicked on parent item.`);
            action = new draggedItem(e);
            parentOffspring.push(action);
        } else {
            //console.debug(`Clicked on hotbar item.`);
            action = findItem(e.target);
        }

        // Find absolute coordinates for offset calculation
        const coords = [e.target, document.body].map(n => n.getBoundingClientRect());

        // Refresh node data
        action.offset = {
            x: (coords[0].x - Math.abs(document.body.offsetLeft)) - e.clientX,
            y: (coords[0].y - Math.abs(document.body.offsetTop)) - e.clientY
        };
        action.origin = e.target.parentNode;

        // Flag action as being dragged
        action.node.style.pointerEvents = "none"; // !important
        action.node.style.position = "absolute";
        action.node.style.left = (e.clientX + action.offset.x) + "px";
        action.node.style.top = (e.clientY + action.offset.y) + "px";
        document.getElementById("dragged-item").appendChild(action.node);

        // Make dragged item follow the cursor
        window.addEventListener("mousemove", moveItem);
    }
    function findItem(node) {
        const item = node ? node : document.getElementById("dragged-item").lastChild;

        return parentOffspring.find(action => {
            if ( item === null ) return false;
            return action.node.getAttribute("data-uuid") === item.getAttribute("data-uuid");
        })
    }
    function moveItem(e) { // on mousemove
        findItem().move(e);
    }
    function releaseItem(e) { // on mouseup
        e.stopImmediatePropagation(); // !important

        // Ignore if button =/= M1
        if (e.button > 0) return;
        
        // Return if no item is being dragged
        if ( findItem() === undefined ) return;

        const action = findItem();

        if ( [e.target, e.target.parentNode].some(node => node && node.hasAttribute("data-slot")) ) {

            // Abort if clicking and releasing on the same spot
            if ( e.target.parentNode.isEqualNode(action.origin) ) return action.clean();

            if ( [e.target, e.target.children[0]].some(node => node && node.classList.contains("item")) ) {
                // Select actual target when releasing button not exactly on top of an .item
                const target = ( e.target.children[0] && 
                    e.target.children[0].classList.contains("item") ) ? 
                    e.target.children[0] : e.target;

                if ( action.origin.hasAttribute("data-slot") ) {
                    //console.debug(`Swapping ${action.origin.getAttribute("data-slot")} and ${target.parentNode.getAttribute("data-slot")} items positions.`);
                    action.swap(target);
                } else {
                    //console.debug(`Overwriting action on ${target.parentNode.getAttribute("data-slot")}.`);
                    action.replace(target);
                }
            } else {
                //console.debug(`Released on empty slot ${e.target.getAttribute("data-slot")}.`);
                e.target.appendChild(action.node);
            }
            
            action.clean();
        } else {
            //console.debug(`Invalid release spot, deleting dragged action.`);
            action.delete();
        }
    }
    function clearSelection() {
        if( document.selection && document.selection.empty ) {
            document.selection.empty();
        } else if( window.getSelection ) {
            const sel = window.getSelection();
            sel.removeAllRanges();
        }
    }
})()