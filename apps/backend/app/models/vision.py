import base64
from typing import Any, Dict, List, Optional
from app.config import settings
from app.models.base import ChatMessage, GenerationRequest, GenerationResponse
from app.models.local_client import LocalClient


class VisionClient:
    """
    Multimodal vision client supporting models with vision projectors (e.g. Ornith-1.5-9B with mmproj, LLaVA).
    Encodes images into OpenAI-compatible base64 payload blocks.
    """

    def __init__(self, client: Optional[LocalClient] = None, model: Optional[str] = None):
        self.client = client or LocalClient(
            base_url=settings.active_model_endpoint,
            default_model=model or (settings.vllm_model if settings.serving_backend == "vllm" else settings.default_vision_model),
            timeout=settings.active_timeout_seconds,
        )
        self.model = model or self.client.default_model

    @staticmethod
    def encode_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        """Encodes raw image bytes into a data URI."""
        b64_str = base64.b64encode(image_bytes).decode("utf-8")
        return f"data:{mime_type};base64,{b64_str}"

    async def analyze_image(
        self,
        image_bytes: bytes,
        prompt: str,
        mime_type: str = "image/jpeg",
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
    ) -> GenerationResponse:
        data_uri = self.encode_image(image_bytes, mime_type)

        content_parts: List[Dict[str, Any]] = [
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {
                    "url": data_uri,
                },
            },
        ]

        messages = []
        if system_prompt:
            messages.append(ChatMessage(role="system", content=system_prompt))
        messages.append(ChatMessage(role="user", content=content_parts))

        request = GenerationRequest(
            model=self.model,
            messages=messages,
            temperature=temperature,
        )

        return await self.client.chat(request)
