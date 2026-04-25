Plan to fix the testimonial section

1. Replace the broken draggable marquee behavior
- Remove the `DraggableMarquee` wrapper from the testimonial section.
- Stop using drag-to-pan on top of the animated marquee, since the competing transforms are causing cropped cards and viewport movement.
- Keep the testimonial copy and section placement exactly as-is.

2. Convert testimonials into a standard interactive slider
- Use the existing carousel/slider components already in the project.
- Show testimonial cards in a horizontal row with overflow clipped correctly.
- Add left and right arrow buttons so users can move the cards manually.
- Configure the slider to loop endlessly, so the 3 testimonials can cycle without reaching a dead end.

3. Preserve visual style
- Keep the dark testimonial background, subtle grid, glow accent, card styling, star ratings, and edge fade treatment where appropriate.
- Ensure cards are not cropped vertically or horizontally.
- Keep spacing consistent with the current landing page.

4. Clean up unused code
- Remove the `DraggableMarquee` import from the landing page.
- If the draggable component is no longer used elsewhere, remove or leave it unused depending on project cleanup preference during implementation.

Technical details
- The current issue comes from combining the CSS marquee animation transform with an additional drag `translateX` transform on the marquee wrapper. This causes the clipping/crop area and animated track to fight each other.
- The safer implementation is an Embla-based carousel using the project’s existing `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, and `CarouselNext` components with loop enabled.
- Each slide can use a responsive basis, such as one card on smaller widths and multiple cards on desktop, while preserving an infinite loop.