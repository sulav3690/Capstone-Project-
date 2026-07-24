from compression_middleware.middleware import CompressionMiddleware as BaseCompressionMiddleware


class CompressionMiddleware(BaseCompressionMiddleware):
    """
    Lossless Compression Middleware wrapping django-compression-middleware.
    Ensures that only responses larger than 1KB (1024 bytes) are compressed
    using GZip or Brotli depending on client capabilities.
    """
    def process_response(self, request, response):
        # Safely extract Content-Length
        if response.has_header('Content-Length'):
            try:
                size = int(response['Content-Length'])
                if size < 1024:
                    return response
            except ValueError:
                pass
        else:
            # Fallback to checking length of content if content is computed
            if hasattr(response, 'content'):
                if len(response.content) < 1024:
                    return response

        # Delegate actual Brotli/Gzip logic to standard package
        return super().process_response(request, response)
