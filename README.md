## Interactive Carousel

A reusable carousel component built with React + TypeScript.
Supports desktop and mobile layouts, with smooth animations and drag/swipe interactions.

### Tech Stack
- React
- TypeScript
- Vite
- CSS 

## Demo

![Carousel Demo](./public/assets/desktop_carousel.gif)

## **Installation & Run Locally**

### **1. Clone the repository**

```bash
git clone https://github.com/ThaoLang/interactive-carousel.git
cd my-carousel
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

   * If dragged more than **50px**, move to next/previous slide
   * Otherwise, snap back to original position

### **Touch Swipe (Mobile)**

Same logic as mouse drag but using:

* `onTouchStart`
* `onTouchMove`
* `onTouchEnd`


## **How Infinite Loop is Implemented**
The carousel uses an **extended slides array** by cloning a few slides at both ends of the original list:

```ts
const head = slides.slice(-VISIBLE_SLIDES);
const tail = slides.slice(0, VISIBLE_SLIDES);
return [...head, ...slides, ...tail];
```

When the carousel reaches a cloned slide at either end, it instantly resets to the corresponding real slide **without animation**, creating a seamless loop with no flicker or visible jump.


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

When reaching cloned slides, the position is reset **without animation**, maintaining visual continuity.

### 3. Dragging outside carousel

If the user drags and releases outside the viewport, the interaction is safely finalized to avoid inconsistent states.

### 4. Responsive behavior

The component adapts to different screen sizes while maintaining:

* **Card size: 300 × 300 px**
* **Viewport: 750 × 300 px (shows ~2.5 cards)**