import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./Carousel.css";
import type { Slide } from "./types";

const SLIDE_INTERVAL = 3000;
const MIN_DRAG_DISTANCE = 40;
const VISIBLE_SLIDES = 3;
const BASE_CARD_WIDTH = 300;   
const BASE_VIEWPORT = 750;

function getCardWidth(): number {
    const vw = window.innerWidth;
    if (vw >= BASE_VIEWPORT) return BASE_CARD_WIDTH;

    return vw / 2.5;
}

interface CarouselProps {
    slides: Slide[];
}

export default function Carousel({ slides }: CarouselProps) {
    const extendedSlides = useMemo(() => {
        const head = slides.slice(-VISIBLE_SLIDES);
        const tail = slides.slice(0, VISIBLE_SLIDES);
        return [...head, ...slides, ...tail];
    }, [slides]);

    useEffect(() => {
        extendedSlides.forEach((slide) => {
            const img = new Image();
            img.src = slide.image;
        });
    }, [extendedSlides]);

    const initialIndex = VISIBLE_SLIDES;

    const [cardWidth, setCardWidth] = useState(getCardWidth);
    const cardWidthRef = useRef(cardWidth);

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [dragDistance, setDragDistance] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const currentTranslateRef = useRef(0);
    const prevTranslateRef = useRef(0);

    const [isDraggingState, setIsDraggingState] = useState(false);

    const carouselRef = useRef<HTMLDivElement | null>(null);
    const autoSlideRef = useRef<number | null>(null);

    useEffect(() => {
        const onResize = () => {
            const next = getCardWidth();
            setCardWidth(next);
            cardWidthRef.current = next;

            if (carouselRef.current) {
                const translate = -currentIndex * next;
                carouselRef.current.style.transform = `translateX(${translate}px)`;
                prevTranslateRef.current = translate;
                currentTranslateRef.current = translate;
            }
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [currentIndex]);

    const getTranslateX = useCallback(
        (index: number) => -index * cardWidthRef.current,
        [] 
    );

    useEffect(() => {
        if (!isHovered && !isDraggingState) {
            autoSlideRef.current = setInterval(() => {
                setCurrentIndex((prev) => prev + 1);
            }, SLIDE_INTERVAL);
        }

        return () => {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
        };
    }, [isHovered, isDraggingState]);

    useEffect(() => {
        if (!carouselRef.current) return;

        const total = slides.length;

        if (currentIndex === total + VISIBLE_SLIDES) {
            setTimeout(() => {
                if (!carouselRef.current) return;
                carouselRef.current.style.transition = "none";
                setCurrentIndex(VISIBLE_SLIDES);
                const newTranslate = getTranslateX(VISIBLE_SLIDES);
                carouselRef.current.style.transform = `translateX(${newTranslate}px)`;
                prevTranslateRef.current = newTranslate;
                currentTranslateRef.current = newTranslate;
            }, 350);
        }

        if (currentIndex === 0) {
            setTimeout(() => {
                if (!carouselRef.current) return;
                carouselRef.current.style.transition = "none";
                setCurrentIndex(total);
                const newTranslate = getTranslateX(total);
                carouselRef.current.style.transform = `translateX(${newTranslate}px)`;
                prevTranslateRef.current = newTranslate;
                currentTranslateRef.current = newTranslate;
            }, 350);
        }
    }, [currentIndex, slides.length, getTranslateX]);

    useEffect(() => {
        if (!isDraggingState && carouselRef.current) {
            const translate = getTranslateX(currentIndex);

            carouselRef.current.style.transition = "transform 0.35s ease-out";
            carouselRef.current.style.transform = `translateX(${translate}px)`;

            prevTranslateRef.current = translate;
            currentTranslateRef.current = translate;
        }
    }, [currentIndex, isDraggingState, getTranslateX]);

    const handleDragStart = (x: number) => {
        isDraggingRef.current = true;
        setIsDraggingState(true); 

        startXRef.current = x;

        const startTranslate = getTranslateX(currentIndex);
        prevTranslateRef.current = startTranslate;
        currentTranslateRef.current = startTranslate;

        setDragDistance(0);

        if (carouselRef.current) {
            carouselRef.current.style.transition = "none";
        }
    };

    const handleDragMove = (x: number) => {
        if (!isDraggingRef.current || !carouselRef.current) return;

        const diff = x - startXRef.current;
        setDragDistance(Math.abs(diff));
        const newTranslate = prevTranslateRef.current + diff;

        currentTranslateRef.current = newTranslate;
        carouselRef.current.style.transform = `translateX(${newTranslate}px)`;
    };

    const handleDragEnd = () => {
        if (!isDraggingRef.current) return; 

        isDraggingRef.current = false;
        setIsDraggingState(false);

        const movedBy = currentTranslateRef.current - prevTranslateRef.current;

        if (Math.abs(movedBy) > MIN_DRAG_DISTANCE) {
            setCurrentIndex((prev) => (movedBy < 0 ? prev + 1 : prev - 1));
        } else {
            if (carouselRef.current) {
                carouselRef.current.style.transition = "transform 0.3s ease-out";
                carouselRef.current.style.transform =
                    `translateX(${prevTranslateRef.current}px)`;
            }
        }

        setTimeout(() => setDragDistance(0), 100);
    };

    const handleCardClick = (e: React.MouseEvent, url: string) => {
        if (dragDistance > 5) {
            e.preventDefault();
            return;
        }
        window.open(url, "_blank");
    };

    return (
        <div className="carousel-container">
            <div
                className="carousel-viewport"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    ref={carouselRef}
                    className={`carousel-track ${isDraggingState ? "dragging" : ""}`}
                    style={{ transform: `translateX(${-initialIndex * cardWidth}px)` }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        handleDragStart(e.clientX);
                    }}
                    onMouseMove={(e) => handleDragMove(e.clientX)}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={() => {
                        if (isDraggingRef.current) handleDragEnd();
                    }}
                    onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                    onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                    onTouchEnd={handleDragEnd}
                >
                    {extendedSlides.map((slide, i) => (
                        <div
                            key={`${slide.id}-${i}`}
                            className="carousel-card"
                            style={{ minWidth: cardWidth, maxWidth: cardWidth }}
                            onClick={(e) => handleCardClick(e, slide.landing_page)}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                draggable="false"
                                className="carousel-image"
                            />
                            <div className="carousel-title">{slide.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};