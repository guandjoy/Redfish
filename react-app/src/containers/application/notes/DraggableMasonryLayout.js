import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

function Ghost(props) {
  return (
    <div
      style={{
        position: "fixed",
        visibility: "visible",
        transform: `translate(${props.x}px, ${props.y}px)`,
        pointerEvents: "none"
      }}
    >
      {props.children}
    </div>
  );
}

/////////////////////////
/* Draggable component */
/////////////////////////
var longPress;
var renderChildren;
var ghost;

//////////////////////////////
/* Masonry layout component */
//////////////////////////////

function DraggableMasonryLayout(props) {
  const generateItems = () =>
    React.Children.map(props.children, (child, index) => {
      console.log("init item");
      return {
        index: index,
        id: child.key,
        order: index,
        element: React.cloneElement(child, {
          draggableItem: {
            onMouseDown: e => onMouseDown(e, index),
            onMouseEnter: e => onMouseEnterItem(e, index),
            onDragEnd: e => onDragEnd(e, index),
            onTouchStart: onTouchStart,
            onTouchMove: onTouchMove,
            onTouchEnd: onTouchEnd,
            onClick: onClickEvent
          }
        })
      };
    });
  // General
  const [items, setItems] = useState(() => generateItems());
  const [overItemIndex, setOverItemIndex] = useState(undefined);
  const [cursorPos, setCursorPos] = useState(undefined);
  // const [cursorPosX, setCursorPosX] = useState(undefined);
  // const [cursorPosY, setCursorPosY] = useState(undefined);
  const [lastRearrangedItemId, setLastRearrangedItemId] = useState();
  const [isRearranges, setIsRearranges] = useState(false);
  // Touch events
  const [isTouch, setIsTouch] = useState(false);
  const [UILog, setUILog] = useState("");
  // Drag events
  const [dragItemIndex, setDragItemIndex] = useState();
  const [preventClick, setPreventClick] = useState();
  const [dragPoint, setDragPoint] = useState({ x: 0, y: 0 });

  /////////////////////
  /* Events' methods */
  /////////////////////

  const getItemById = id => {
    // Return object with required id from items array
    let indexOfItem;
    for (var i = 0, len = props.children.length; i < len; i++) {
      if (items[i].id === id) {
        indexOfItem = i;
        break;
      }
    }
    // not support IE8
    // let indexOfItem = items.findIndex(item => item.id === id);
    return items[indexOfItem];
  };

  const initDrag = (cursor, itemIndex) => {
    /* Initialize dragging via assigning dragPoint and dragItem
    Require arguments: 
      cursor: {x, y} // clientX, clientY of a mouse or a touch
      item: {id, content, order} // Objects from items array
    */
    let dragElementWrapper = document.getElementById(
      `${items[itemIndex].id}-wrapper`
    );
    setDragPoint({
      x: cursor.x - dragElementWrapper.offsetLeft,
      y: cursor.y - dragElementWrapper.offsetTop
    });
    setDragItemIndex(itemIndex);
    ghost = React.cloneElement(items[itemIndex].element);
  };

  useEffect(() => {
    var newItems;
    var newOrder = [];
    setItems(() => {
      if (
        dragItemIndex &&
        overItemIndex &&
        overItemIndex !== dragItemIndex &&
        !isRearranges
      ) {
        console.log("rearrange");
        items.forEach((item, index) => {
          newOrder[index] = item.order; // Item is out of range. Keep same order
          // Override for items need to be changed
          if (items[dragItemIndex].order < items[overItemIndex].order) {
            // Drag toward the end
            if (
              item.order > items[dragItemIndex].order &&
              item.order <= items[overItemIndex].order
            )
              // Inbetween notes. Replace on one to the start
              newOrder[index] = item.order - 1;
            if (item.order === items[dragItemIndex].order)
              // Assign new order to the draggable
              newOrder[index] = items[overItemIndex].order;
          }
          if (items[dragItemIndex].order > items[overItemIndex].order) {
            // Drag toward the start
            if (
              item.order < items[dragItemIndex].order &&
              item.order >= items[overItemIndex].order
            )
              // Inbetween notes. Replace on one to the end
              newOrder[index] = item.order + 1;
            if (item.order === items[dragItemIndex].order)
              // Assign new order to the draggable
              newOrder[index] = items[overItemIndex].order;
          }
        });
        newItems = items.map((item, index) => {
          item.order = newOrder[index];
          return item;
        });
        setIsRearranges(true);
        return newItems;
      }
      return items;
    });
  }, [overItemIndex]);

  const cleanupDrag = () => {
    ghost = undefined;
    setUILog("cleanup");
    setDragItemIndex(undefined);
    setOverItemIndex(undefined);
    setLastRearrangedItemId(undefined);
    setCursorPos(undefined);
    setDragPoint(undefined);
  };

  //////////////////////////
  /* Touch screens events */
  //////////////////////////

  const onTouchStart = e => {
    e.preventDefault();
    e.stopPropagation();
    const touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const fingers = e.touches.length;
    setIsTouch(true);
    setCursorPos({ x: touchPos.x, y: touchPos.y });
    longPress =
      fingers === 1 &&
      setTimeout(() => {
        e.preventDefault();
        let touchElement = document.elementFromPoint(touchPos.x, touchPos.y);
        initDrag(
          { x: touchPos.x, y: touchPos.y },
          getItemById(touchElement.id)
        );
      }, 500);
  };

  const onTouchMove = e => {
    e.preventDefault();
    e.stopPropagation();
    let freshDragItem;
    setDragItemIndex(dragItem => {
      freshDragItem = dragItem;
      return dragItem;
    });
    !freshDragItem && clearTimeout(longPress);
    setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    let overObjectId = document.elementFromPoint(
      e.touches[0].clientX,
      e.touches[0].clientY
    ).id;
    setUILog(overObjectId);
    if (overObjectId && freshDragItem) {
      let overTouchItem = getItemById(overObjectId);
      setOverItemIndex(overTouchItem);
    }
  };

  const onTouchEnd = e => {
    let freshDragItem;
    setUILog("touch end");
    setDragItemIndex(dragItem => {
      freshDragItem = dragItem;
      return undefined;
    });
    !freshDragItem && clearTimeout(longPress); // Cancel drag event for touch scn
    cleanupDrag();
    setIsTouch(false);
  };

  //////////////////
  /* Mouse events */
  //////////////////

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const onMouseUp = e => {
    console.log("mouse up");
    cleanupDrag();
  };

  const onMouseDown = (e, itemIndex) => {
    let freshIsTouch;
    setIsTouch(isTouch => {
      freshIsTouch = isTouch;
      return isTouch;
    });
    freshIsTouch && e.preventDefault();
    setCursorPos({ x: e.clientX, y: e.clientY });
    setPreventClick(false);
    !freshIsTouch && initDrag({ x: e.clientX, y: e.clientY }, itemIndex);
  };

  const onMouseEnterItem = (e, overItemIndex) => {
    setOverItemIndex(overItemIndex);
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const onMouseMove = e => {
    e.preventDefault();
    e.stopPropagation();
    let freshDragItem;
    setDragItemIndex(dragItemIndex => {
      freshDragItem = dragItemIndex;
      return dragItemIndex;
    });
    setPreventClick(freshDragItem ? true : false);
    setCursorPos(freshDragItem ? { x: e.clientX, y: e.clientY } : cursorPos);
  };

  const onDragEnd = () => {
    // Cleanup after dragging
    cleanupDrag();
  };

  const onClickCapture = e => {
    // Prevent onClick event when dragging
    preventClick && e.stopPropagation();
  };

  ////////////////////
  /* Masonry Layout */
  ////////////////////
  const cloneChildren = () =>
    React.Children.map(props.children, (child, index) =>
      // Change eash child
      React.cloneElement(child, {
        draggableItem: {
          // draggable: "true",
          onMouseDown: e => onMouseDown(e, items[index]),
          onMouseEnter: e => onMouseEnterItem(e, items[index]),
          // onDragOver: e => onDragOverItem(e, items[index]),
          onDragEnd: e => onDragEnd(e, items[index]),
          onTouchStart: onTouchStart,
          onTouchMove: onTouchMove,
          onTouchEnd: onTouchEnd,
          onClick: onClickEvent
        }
      })
    );

  const [modChildren, setModChildren] = useState(() => cloneChildren());
  const [columns, setColumns] = useState(0);
  const [transition, setTransition] = useState(false);
  const [layout, setLayout] = useState({
    elements: [],
    width: 0,
    height: 0,
    endline: {
      start: { x: undefined, y: undefined },
      end: { x: undefined, y: undefined },
      byColumns: [],
      enterEvent: {
        elementsNum: 0,
        eventHandler: props.onEndlineEnter && props.onEndlineEnter
      }
    }
  });
  const [onErrorCount, setOnErrorCount] = useState(0);
  const [onLoadCount, setOnLoadCount] = useState(0);

  const masonryLayout = useRef(); // Top wrapper
  const endlineStartRef = useRef(); // Endline start sensor
  const endlineEndRef = useRef(); // Endline end sensor

  useEffect(() => {
    // Mount and unmount only
    // Add/remove event listeners
    checkLayout();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleResize = evt => {
    checkLayout(evt);
  };

  const checkLayout = evt => {
    const wrapperWidth = masonryLayout.current.offsetWidth;
    let cardWrapperWidth = document.getElementById(`${items[0].id}-wrapper`)
      .offsetWidth;
    setColumns(Math.floor(wrapperWidth / cardWrapperWidth));
    // turn on transition if window resizing
    setTransition(evt !== undefined);
  };

  const handleScroll = e => {
    checkEndlineEnterEvent();
  };

  const checkEndlineEnterEvent = () => {
    setLayout(layout => {
      if (
        endlineStartRef.current &&
        endlineStartRef.current.getBoundingClientRect().top -
          window.innerHeight <=
          0 &&
        layout.endline.enterEvent.elementsNum !== layout.elements.length
      ) {
        // enter endline event
        layout.endline.enterEvent.elementsNum = layout.elements.length;
        // execute enter endline event handler
        layout.endline.enterEvent.eventHandler &&
          layout.endline.enterEvent.eventHandler();
      }
      return layout;
    });
  };

  useEffect(() => {
    // component did mount or update
    if (masonryLayout.current.offsetHeight > 0) {
      // if layout rendered
      checkEndlineEnterEvent();
      setTransition(true);
    }
  });

  useEffect(() => {
    // if number of children changed
    setTransition(() => {
      if (props.children.length > layout.elements.length) {
        // disable transition for infinite scroll
        return false;
      } else if (props.children.length === layout.elements.length) {
        // enable for creation or change
        return true;
      } else if (props.children.length < layout.elements.length) {
        // enable for deletion
        return true;
      }
    });
  }, [props.children.length]);

  useEffect(() => {
    setItems(() => generateItems());
    // setModChildren(() => cloneChildren())
  }, [props.children]);

  useEffect(() => {
    setModChildren(() => cloneChildren());
  }, [items]);

  useEffect(() => {
    // set layout
    var elements = [];
    var endline = layout.endline;
    var cardWrapperWidth;
    endline.byColumns = [];
    for (let i = 0; i < columns; i++) {
      endline.byColumns[i] = 0;
    }
    let itemsSortedByOrder = items.concat().sort((a, b) => a.order - b.order);
    itemsSortedByOrder.forEach((item, index) => {
      // Calculate positions of each element
      let cardWrapperElement = document.getElementById(`${item.id}-wrapper`);
      let cardElement = document.getElementById(item.id);
      let height = cardWrapperElement.offsetHeight;
      cardWrapperWidth = cardWrapperElement.offsetWidth;
      let leastNum = Math.min(...endline.byColumns);
      let leastNumIndex = endline.byColumns.indexOf(leastNum);
      let x = leastNumIndex * cardWrapperWidth;
      let y = endline.byColumns[leastNumIndex];
      let cardWidth = cardElement.offsetWidth;
      let cardHeight = cardElement.offsetHeight;
      let cardOffsetLeft = cardElement.offsetLeft;
      let cardOffsetTop = cardElement.offsetTop;
      elements[item.index] = {
        x,
        y,
        cardWidth,
        cardHeight,
        cardOffsetLeft,
        cardOffsetTop
      };
      endline.byColumns[leastNumIndex] += height;
    });
    endline.start.x =
      cardWrapperWidth *
      endline.byColumns.indexOf(Math.min(...endline.byColumns));
    endline.start.y = Math.min(...endline.byColumns);
    endline.end.x =
      cardWrapperWidth *
      endline.byColumns.indexOf(Math.max(...endline.byColumns));
    endline.end.y = Math.max(...endline.byColumns);
    setLayout({
      elements: elements, // list of all elements with coorditares
      width: cardWrapperWidth * columns, // width of the whole layout
      height: endline.end.y, // height of the whole layout
      endline: endline
    });
  }, [columns, onLoadCount, onErrorCount, modChildren]);

  const errorHandler = index => {
    setOnErrorCount(onErrorCount + 1);
    console.log("can't load: ", index);
  };

  const loadHandler = index => {
    setOnLoadCount(onLoadCount + 1);
  };

  const onClickEvent = e => {
    console.log("click");
  };

  renderChildren = React.Children.map(props.children, (child, index) => {
    // Change eash child
    let newComponent = (
      <div
        className="element-bounding"
        id={`${child.key}-wrapper`}
        order={child.props.order}
        style={{
          position: "absolute",
          margin: 0,
          padding: 0,
          touchAction: "none",
          top: `${layout.elements[index] ? layout.elements[index].y : 0}px`,
          left: `${layout.elements[index] ? layout.elements[index].x : 0}px`,
          transition: `${transition ? "top 0.4s, left 0.4s" : "none"}`,
          visibility: transition ? "visible" : "hidden",
          opacity: dragItemIndex === items[index].index ? 0 : 1
        }}
        onLoad={loadHandler}
        onError={errorHandler}
        onTransitionEnd={() => setIsRearranges(false)}
        onClickCapture={onClickCapture}
      >
        {items[index].element}
      </div>
    );
    return newComponent;
  });
  return (
    <div className="masonry" ref={masonryLayout}>
      <div
        style={{
          position: "relative",
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          margin: "0 auto 0 auto"
        }}
        className="boundry-box"
      >
        {renderChildren}
        {ghost && (
          <Ghost
            x={cursorPos.x - dragPoint.x - window.scrollX}
            y={cursorPos.y - dragPoint.y - window.scrollY}
          >
            {ghost}
          </Ghost>
        )}
        {layout.endline.start.y !== undefined && (
          <React.Fragment>
            <div
              id="MasonryLayoutEndlineStart"
              ref={endlineStartRef}
              style={{
                position: "absolute",
                top: `${layout.endline.start.y}px`,
                left: `${layout.endline.start.x}px`
              }}
            />
            <div
              id="MasonryLayoutEndlineEnd"
              ref={endlineEndRef}
              style={{
                position: "absolute",
                top: `${layout.endline.end.y}px`,
                left: `${layout.endline.end.x}px`
              }}
            />
          </React.Fragment>
        )}
      </div>
      <h5 style={{ position: "fixed", bottom: "70px" }}>
        drag item: {dragItemIndex && items[dragItemIndex].id}
      </h5>
      <h5 style={{ position: "fixed", bottom: "50px" }}>
        over item: {overItemIndex && items[overItemIndex].id}
      </h5>
      <h5 style={{ position: "fixed", bottom: "30px" }}>
        is touch: {isTouch.toString()}
      </h5>
      <h5 style={{ position: "fixed", bottom: "10px" }}>ui log: {UILog}</h5>
    </div>
  );
}

DraggableMasonryLayout.propTypes = {
  onEndlineEnter: PropTypes.func
};

export default DraggableMasonryLayout;