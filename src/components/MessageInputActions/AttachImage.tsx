import { ImagePlus, X } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import { useChat } from '@/lib/hooks/useChat';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const readAsDataURL = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Hook that turns image Files/Blobs into data URLs and adds them to the chat. */
export const useAddImages = () => {
  const { setImages } = useChat();

  return async (files: Blob[]) => {
    const valid = files.filter((f) => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error('Images must be 5 MB or smaller.');
        return false;
      }
      return true;
    });
    if (!valid.length) return;

    try {
      const urls = await Promise.all(valid.map(readAsDataURL));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error('Failed to read image.');
    }
  };
};

/** Paste handler for textareas: attaches pasted images, leaves text paste alone. */
export const useImagePaste = () => {
  const addImages = useAddImages();

  return (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null);

    if (files.length) {
      e.preventDefault();
      addImages(files);
    }
  };
};

/** Thumbnails of pending images, each with a remove button. */
export const ImagePreviews = () => {
  const { images, setImages } = useChat();

  if (!images.length) return null;

  return (
    <div className="flex flex-row flex-wrap gap-2 px-2 pb-2 w-full">
      {images.map((src, i) => (
        <div key={i} className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Attached image"
            className="h-14 w-14 object-cover rounded-md border border-light-200 dark:border-dark-200"
          />
          <button
            type="button"
            onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
            className="absolute -top-1.5 -right-1.5 bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded-full p-0.5 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
};

const AttachImage = () => {
  const addImages = useAddImages();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      title="Attach image"
      onClick={() => inputRef.current?.click()}
      className="flex items-center justify-center p-2 rounded-lg text-black/50 dark:text-white/50 hover:bg-light-200 hover:dark:bg-dark-200 hover:text-black dark:hover:text-white active:scale-95 transition duration-200"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          await addImages(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      <ImagePlus size={16} />
    </button>
  );
};

export default AttachImage;
