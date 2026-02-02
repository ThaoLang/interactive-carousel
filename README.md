## Interactive Carousel

A reusable carousel component built with React + TypeScript.
Supports desktop and mobile layouts, with smooth animations and drag/swipe interactions.

### Tech Stack
- React
- TypeScript
- Vite
- CSS 

## ** Project Structure**

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

The project follows a component-driven architecture centered around a reusable Carousel component.

src/components/Carousel/ contains the encapsulated carousel logic and UI, including the React implementation (Carousel.tsx), styling (Carousel.css), and shared TypeScript definitions (types.ts). This ensures separation of concerns and reusability.

src/data/slides.ts acts as a mock data source representing slide content that would typically be fetched from an API in a real-world application.

App.tsx serves as the root UI component that integrates and renders the Carousel with the provided slide data.

main.tsx is the application entry point responsible for bootstrapping the React app.

index.css provides global styling applied across the application.

Overall, the structure promotes modularity, maintainability, and clear separation between data, presentation, and application setup.


---

## **🚀 Installation & Run Locally**

### **1️⃣ Clone the repository**

```bash
git clone https://github.com/your-username/carousel-home-test.git
cd carousel-home-test
```

### **2️⃣ Install dependencies**

```bash
npm install
```

or

```bash
yarn install
```

### **3️⃣ Run the project**

```bash
npm run dev
```

Then open in browser:

```
http://localhost:5173/
```

---

## **🧠 How Drag & Swipe Works**

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

This ensures a smooth mobile experience.

---

## **🔁 How Infinite Loop is Implemented**

We use a technique called **extended slides**:

Original slides:

```
[A, B, C, D, E]
```

We clone slides at both ends:

```
[C, D, E, A, B, C, D, E, A, B]
```

This allows:

* Seamless transition from last → first
* No visible flicker or jump

When reaching the cloned slide, we instantly reset position **without animation**, so user never notices.

---

## **🛑 Preventing Accidental Clicks While Dragging**

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

---

## **⏸ Pause on Hover**

When user hovers over the carousel, auto-slide stops:

```ts
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
```

If not hovered → auto-slide resumes.

---