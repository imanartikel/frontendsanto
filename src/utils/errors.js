export const extractErrorMsg = (err, defaultMsg) => {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || defaultMsg;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(d => `${d.loc?.[d.loc.length - 1] || 'field'}: ${d.msg}`).join(', ');
  }
  return defaultMsg;
};
