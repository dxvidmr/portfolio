import { db } from '$lib/server/db';

export type ActivityOrderMode = 'date' | 'manual';

const settingKey = 'activity_order_mode';

export function parseActivityOrderMode(value: FormDataEntryValue | null): ActivityOrderMode | null {
	return value === 'date' || value === 'manual' ? value : null;
}

export async function getActivityOrderMode(): Promise<ActivityOrderMode> {
	try {
		const result = await db.execute({
			sql: 'SELECT value FROM site_settings WHERE key = ? LIMIT 1',
			args: [settingKey]
		});
		return result.rows[0]?.value === 'manual' ? 'manual' : 'date';
	} catch (cause) {
		if (cause instanceof Error && cause.message.includes('no such table: site_settings')) {
			return 'date';
		}
		throw cause;
	}
}

export async function setActivityOrderMode(mode: ActivityOrderMode): Promise<void> {
	await db.execute({
		sql: `INSERT INTO site_settings (key, value, updated_at)
			VALUES (?, ?, datetime('now'))
			ON CONFLICT (key) DO UPDATE SET
				value = excluded.value,
				updated_at = datetime('now')`,
		args: [settingKey, mode]
	});
}
