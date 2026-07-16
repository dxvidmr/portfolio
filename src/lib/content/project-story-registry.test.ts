import { describe, expect, it } from 'vitest';
import { hasProjectStory, projectStorySlugs } from './project-story-registry';

describe('registro automático de narrativas del portfolio', () => {
	it('detecta por slug todas las narrativas existentes', () => {
		expect(projectStorySlugs).toEqual([
			'documento-escena',
			'edicion-digital-corpus',
			'etso-plataforma-web',
			'redes-personajes-teatrales',
			'todos-a-una',
			'versologia-metadrama'
		]);
		expect(hasProjectStory('todos-a-una')).toBe(true);
		expect(hasProjectStory('proyecto-sin-narrativa')).toBe(false);
	});
});
