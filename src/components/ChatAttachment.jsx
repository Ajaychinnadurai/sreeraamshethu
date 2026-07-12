import { useRef } from 'react';
import { Paperclip, X as XIcon } from 'lucide-react';
import { readFileAsDataURL, formatFileSize, getFileEmoji, ACCEPTED_FILE_TYPES } from '../utils/chatUtils';

/**
 * Chat attachment component — file picker + preview for the chat input.
 */
export default function ChatAttachment({
  attachment,
  onAttach,
  onRemove,
  disabled
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileData = await readFileAsDataURL(file);
      onAttach(fileData);
    } catch (err) {
      alert(err.message || 'Failed to read file');
    }

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="chat-file-input"
        disabled={disabled}
      />

      {/* Attachment button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--gray-400)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.5 : 1
        }}
        title="Attach image or document"
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = 'var(--vgn-blue-dark)'; }}
        onMouseLeave={e => { if (!disabled) e.currentTarget.style.color = 'var(--gray-400)'; }}
      >
        <Paperclip size={16} />
      </button>

      {/* Attachment preview (shown when a file is selected) */}
      {attachment && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--vgn-blue-light)',
            borderRadius: '8px',
            padding: '4px 8px',
            maxWidth: '160px',
            border: '1px solid rgba(212,175,55,0.2)'
          }}
        >
          {/* Preview thumbnail or file icon */}
          {attachment.isImage ? (
            <img
              src={attachment.dataUrl}
              alt="Preview"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                objectFit: 'cover',
                flexShrink: 0
              }}
            />
          ) : (
            <span style={{ fontSize: '18px', lineHeight: 1 }}>
              {getFileEmoji(attachment.type)}
            </span>
          )}

          {/* File info */}
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: 'var(--vgn-blue-dark)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {attachment.name}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--gray-400)' }}>
              {formatFileSize(attachment.size)}
            </div>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: 'rgba(0,0,0,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--gray-500)',
              padding: 0,
              fontSize: '10px',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
          >
            <XIcon size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
