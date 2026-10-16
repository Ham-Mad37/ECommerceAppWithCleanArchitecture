namespace ECommerce.Application.Common.Utilities
{
    public static class ImageSignature
    {
        // Returns ".jpg", ".png" or ".webp" based on the file's actual bytes, or null if unsupported.
        // The stream must be seekable.
        public static string? DetectExtension(Stream stream)
        {
            Span<byte> header = stackalloc byte[12];

            stream.Position = 0;
            var read = stream.Read(header);
            stream.Position = 0;

            if (read < 12)
                return null;

            if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
                return ".jpg";

            ReadOnlySpan<byte> png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
            if (header[..8].SequenceEqual(png))
                return ".png";

            // "RIFF" .... "WEBP"
            if (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F' &&
                header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P')
                return ".webp";

            return null;
        }
    }
}