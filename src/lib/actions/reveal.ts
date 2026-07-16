type RevealOptions = {
	threshold?: number;
	rootMargin?: string;
};

export function createReveal({ threshold = 0.12, rootMargin = '0px 0px -6% 0px' }: RevealOptions = {}) {
	return function reveal(node: HTMLElement) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		node.classList.add('reveal-pending');
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('reveal-visible');
				observer.disconnect();
			},
			{ threshold, rootMargin }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	};
}
