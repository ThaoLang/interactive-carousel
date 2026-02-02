import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./Carousel.css";
import type { Slide } from "./types";

const CARD_WIDTH = 300;
const SLIDE_INTERVAL = 3000;
const MIN_DRAG_DISTANCE = 50;
const VISIBLE_SLIDES = 3; 

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

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentTranslate, setCurrentTranslate] = useState(0);
    const [prevTranslate, setPrevTranslate] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const carouselRef = useRef<HTMLDivElement | null>(null);
    const autoSlideRef = useRef<number | null>(null);

    const getTranslateX = useCallback(
        (index: number) => -index * CARD_WIDTH,
        []
    );

    useEffect(() => {
        if (!isHovered && !isDragging) {
            autoSlideRef.current = setInterval(() => {
                setCurrentIndex((prev) => prev + 1);
            }, SLIDE_INTERVAL);
        }

        return () => {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
        };
    }, [isHovered, isDragging]);

    useEffect(() => {
        if (!carouselRef.current) return;

        const total = slides.length;

        if (currentIndex === total + VISIBLE_SLIDES) {
            setTimeout(() => {
                carouselRef.current!.style.transition = "none";
                setCurrentIndex(VISIBLE_SLIDES);
                carouselRef.current!.style.transform =
                    `translateX(${getTranslateX(VISIBLE_SLIDES)}px)`;
            }, 350);
        }

        if (currentIndex === 0) {
            setTimeout(() => {
                carouselRef.current!.style.transition = "none";
                setCurrentIndex(total);
                carouselRef.current!.style.transform =
                    `translateX(${getTranslateX(total)}px)`;
            }, 350);
        }
    }, [currentIndex, slides.length, getTranslateX]);

    const prevTranslateRef = useRef(0);

    useEffect(() => {
        if (!isDragging && carouselRef.current) {
            const translate = getTranslateX(currentIndex);

            carouselRef.current.style.transition = "transform 0.35s ease-out";
            carouselRef.current.style.transform = `translateX(${translate}px)`;

            prevTranslateRef.current = translate;
        }
    }, [currentIndex, isDragging, getTranslateX]);

    const handleDragStart = (x: number) => {
        setIsDragging(true);
        setStartX(x);
        const startTranslate = getTranslateX(currentIndex);
        setPrevTranslate(startTranslate);   
        prevTranslateRef.current = startTranslate; 

        setDragDistance(0);

        if (carouselRef.current) {
            carouselRef.current.style.transition = "none";
        }
    };

    const handleDragMove = (x: number) => {
        if (!isDragging || !carouselRef.current) return;

        const diff = x - startX;
        setDragDistance(Math.abs(diff));
        const newTranslate = prevTranslate + diff;

        setCurrentTranslate(newTranslate);
        carouselRef.current.style.transform = `translateX(${newTranslate}px)`;
    };

    const handleDragEnd = () => {
        setIsDragging(false);

        const movedBy = currentTranslate - prevTranslate;

        if (Math.abs(movedBy) > MIN_DRAG_DISTANCE) {
            setCurrentIndex((prev) => (movedBy < 0 ? prev + 1 : prev - 1));
        } else {
            if (carouselRef.current) {
                carouselRef.current.style.transition = "transform 0.3s ease-out";
                carouselRef.current.style.transform = `translateX(${prevTranslate}px)`;
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
                    className={`carousel-track ${isDragging ? "dragging" : ""}`}
                    style={{ transform: `translateX(${getTranslateX(initialIndex)}px)` }}
                    onMouseDown={(e) => handleDragStart(e.clientX)}
                    onMouseMove={(e) => handleDragMove(e.clientX)}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={() => {
                        if (isDragging) handleDragEnd();
                    }}
                    onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                    onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                    onTouchEnd={handleDragEnd}
                >
                    {extendedSlides.map((slide, i) => (
                        <div
                            key={`${slide.id}-${i}`}
                            className="carousel-card"
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