export function loadJobConfig(env = process.env) {
  return {
    managerEmail: env.MANAGER_EMAIL || '',
    from: env.SMTP_FROM || env.SMTP_USER || 'WaraWiri Village <no-reply@warawiri.local>',
    notifyHour: Number(env.NOTIFY_HOUR_WIB) || 7,
    maxAttempts: Number(env.NOTIFY_MAX_ATTEMPTS) || 5,
    // 'h-1' (default, sesuai kartu) atau 'segera' (kirim begitu disetujui — untuk simulasi)
    notifyMode: env.NOTIFY_MODE === 'segera' ? 'segera' : 'h-1',
  }
}
