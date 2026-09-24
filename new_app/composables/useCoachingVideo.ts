export type CoachingVideoError = '' | 'type' | 'play';

/** A local object URL is the entire preview. No upload or server state. */
export function useCoachingVideo() {
  const customSrc = shallowRef('');
  const customName = shallowRef('');
  const fileError = shallowRef<CoachingVideoError>('');
  function clearVideo() {
    if (customSrc.value) URL.revokeObjectURL(customSrc.value);
    customSrc.value = '';
    customName.value = '';
    fileError.value = '';
  }
  function selectVideo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return false;
    if (!file.type.startsWith('video/')) {
      fileError.value = 'type';
      return false;
    }
    clearVideo();
    customSrc.value = URL.createObjectURL(file);
    customName.value = file.name;
    return true;
  }
  function videoError() {
    clearVideo();
    fileError.value = 'play';
  }
  onBeforeUnmount(clearVideo);
  return { customSrc, customName, fileError, selectVideo, clearVideo, videoError };
}
