## Interactive Carousel

A reusable carousel component built with React + TypeScript.
Supports desktop and mobile layouts, with smooth animations and drag/swipe interactions.

### Tech Stack
- React
- TypeScript
- Vite
- CSS 

## Demo (Desktop & Mobile)

### 🖥 **Desktop Demo**

https://youtu.be/0m3t61NAcE8


### 📱 **Mobile Demo**

https://www.youtube.com/watch?v=_wj0oRuj4OA


## **Installation & Run Locally**

### **1. Clone the repository**

```bash
git clone https://github.com/ThaoLang/interactive-carousel.git
cd interactive-carousel
```

### **2. Install dependencies**

```bash
npm install
```

or

```bash
yarn install
```

### **3. Run the project**

```bash
npm run dev
```

Then open in browser:

```
http://localhost:5173/
```
## **Project Structure**

```
src/
  ├── components/
  │   └── Carousel/
  │       ├── Carousel.css
  │       ├── Carousel.tsx
  │       └── types.ts
  │
  ├── data/
  │   └── slides.ts
  │
  ├── App.tsx
  ├── index.css
  └── main.tsx
```

This project follows a **component-driven architecture** with clear separation between UI, logic, and data:

* **`components/Carousel/`**
  Contains the core carousel implementation:

  * `Carousel.tsx`: Main React component handling animation, drag/swipe logic, auto-slide, and infinite loop.
  * `Carousel.css`: Styling for layout, animation, and UX.
  * `types.ts`: Shared TypeScript interface for slide data.

* **`data/slides.ts`**
  Acts as a mock data source representing carousel content.
* **`App.tsx`**
  Root UI component that renders the `Carousel` and passes slide data as props.

* **`main.tsx`**
  Application entry point responsible for bootstrapping React.

* **`index.css`**
  Global styling applied across the application.

## **How Drag & Swipe Works**

### **Mouse Drag (Desktop)**

1. User presses mouse (`onMouseDown`) → record starting X position
2. As the mouse moves (`onMouseMove`), calculate the distance moved
3. Translate carousel track accordingly
4. On release (`onMouseUp`):

   * If dragged more than **40px**, move to next/previous slide
   * Otherwise, snap back to original position

### **Touch Swipe (Mobile)**

Same logic as mouse drag but using:

* `onTouchStart`
* `onTouchMove`
* `onTouchEnd`


## **How Infinite Loop is Implemented**

The carousel uses an **extended slides array** by cloning a few slides at both ends of the original list:

```ts
const head = slides.slice(-VISIBLE_SLIDES); // last 3 slides → prepend
const tail = slides.slice(0, VISIBLE_SLIDES); // first 3 slides → append
return [...head, ...slides, ...tail];
```

The carousel starts at `index = VISIBLE_SLIDES` (the first real slide), so both directions have cloned slides as a buffer.

### Reset logic — both directions

When the carousel reaches a cloned slide at either end, it waits for the slide transition to finish (350ms), then instantly jumps back to the corresponding real slide **without animation**:

```ts
// Reached end clone → jump back to first real slide
if (currentIndex === total + VISIBLE_SLIDES) {
    setTimeout(() => {
        carouselRef.current!.style.transition = "none";
        setCurrentIndex(VISIBLE_SLIDES);
        // ...sync refs
    }, 350);
}

// Reached start clone → jump back to last real slide
if (currentIndex === 0) {
    setTimeout(() => {
        carouselRef.current!.style.transition = "none";
        setCurrentIndex(total);
        // ...sync refs
    }, 350);
}
```

Because the cloned slides are visually identical to the real ones, the jump is invisible to the user — creating a seamless infinite loop in **both directions** (auto-slide forward and drag backward).


## **Preventing Accidental Clicks While Dragging**

We track how much the user drags:

```ts
if (dragDistance > 5) {
  e.preventDefault();
  return;
}
```

This ensures:

* Small movement = click allowed
* Large movement = treated as drag, NOT click

## **Pause on Hover**

When user hovers over the carousel, auto-slide stops:

```ts
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
```

If not hovered → auto-slide resumes.

## Edge Case Handling

### 1. Fast dragging / swiping

All images are **preloaded** using `new Image()` to prevent blank slides when swiping quickly.

### 2. Seamless looping

When reaching cloned slides at either end, the position is reset **without animation** (`transition: none`), maintaining visual continuity in both directions. After the reset, the translate refs are synced to the new position to keep drag calculations accurate.

### 3. Stale closure prevention during drag

During drag, `currentTranslate` and `prevTranslate` are tracked using **refs** (`currentTranslateRef`, `prevTranslateRef`) instead of state. This is because `handleDragEnd` reads these values at the moment the mouse/touch is released — if they were stored in state, the closure inside the event handler would capture an outdated value, causing the drag distance calculation (`movedBy`) to be wrong and the slide transition to fail.

```ts
const movedBy = currentTranslateRef.current - prevTranslateRef.current;
```

### 4. Dragging outside carousel

If the user drags and releases outside the viewport, the interaction is safely finalized via `onMouseLeave` to avoid inconsistent states.

### 5. Responsive behavior

The component adapts to different screen sizes while maintaining:

* **Card size: 300 × 300 px**
* **Viewport: 750 × 300 px (shows ~2.5 cards)**
