"""
AI Advisor endpoints using Google Gemini API
"""

from fastapi import APIRouter, HTTPException
import logging
import os
from dotenv import load_dotenv

from schemas.types import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# Load environment variables
load_dotenv()

# Initialize Gemini API
try:
    import google.generativeai as genai
    
    # Try to get API key from environment or use provided key
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyD7_l4mKtoVWBwLBSVjHcxuPd8HeQFvWBU"
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
        logger.info("Gemini API configured successfully")
    else:
        GEMINI_AVAILABLE = False
        logger.warning("GEMINI_API_KEY not found")
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai package not installed")


@router.post("/chat", response_model=ChatResponse)
async def chat_with_advisor(request: ChatRequest):
    """
    Chat with AI advisor about UHI mitigation strategies
    
    Request body:
    {
        "prompt": "What are mitigation strategies for Mumbai?"
    }
    """
    # Fallback responses
    fallback_responses = {
        "mumbai": "For Mumbai, key mitigation strategies include: 1) Increasing green cover by 25% in high-density areas, 2) Implementing cool roof programs, 3) Creating urban forests in suburban areas, 4) Developing green corridors along major roads, and 5) Promoting water-sensitive urban design.",
        "pune": "For Pune, recommended strategies are: 1) Expanding green corridors along major roads, 2) Promoting rooftop gardens, 3) Implementing water-sensitive urban design, 4) Increasing tree plantation, and 5) Developing cooling infrastructure.",
        "ndvi": "NDVI (Normalized Difference Vegetation Index) is a measure of vegetation health and density. It ranges from -1 to 1, where values closer to 1 indicate healthy, dense vegetation. Higher NDVI values help reduce Urban Heat Island effects by providing shade, evapotranspiration, and reducing surface temperatures. For Maharashtra, increasing NDVI through tree planting, green roofs, and urban parks is crucial for UHI mitigation.",
        "default": "Urban Heat Island mitigation strategies include: 1) Increasing vegetation coverage (NDVI), 2) Reducing built-up area percentage, 3) Implementing cool roofs and reflective surfaces, 4) Creating green infrastructure, 5) Enhancing water management systems, and 6) Promoting sustainable urban planning practices."
    }
    
    try:
        # Try to use Gemini API if available
        if GEMINI_AVAILABLE:
            try:
                # Try different model names - newer API uses gemini-1.5-flash or gemini-1.5-pro
                model_names = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
                model = None
                working_model_name = None
                
                for model_name in model_names:
                    try:
                        logger.info(f"Trying Gemini model: {model_name}")
                        model = genai.GenerativeModel(model_name)
                        # Test with actual API call to verify it works
                        test_response = model.generate_content("Hi")
                        working_model_name = model_name
                        logger.info(f"Successfully using model: {model_name}")
                        break
                    except Exception as e:
                        error_str = str(e)
                        logger.warning(f"Model {model_name} failed: {error_str[:150]}")
                        model = None
                        continue
                
                if model is None:
                    # Try to list available models
                    try:
                        available_models = genai.list_models()
                        model_list = [m.name for m in available_models if 'generateContent' in m.supported_generation_methods]
                        logger.info(f"Found {len(model_list)} available models")
                        if model_list:
                            # Extract model name from full path (e.g., "models/gemini-1.5-flash" -> "gemini-1.5-flash")
                            full_model_name = model_list[0]
                            model_name = full_model_name.split('/')[-1] if '/' in full_model_name else full_model_name
                            model = genai.GenerativeModel(model_name)
                            working_model_name = model_name
                            logger.info(f"Using auto-detected model: {model_name}")
                        else:
                            raise Exception("No available models found")
                    except Exception as list_error:
                        logger.error(f"Could not list models: {list_error}")
                        raise Exception("Could not find a working Gemini model")
                
                # Create a context-aware prompt
                system_context = """You are an AI climate advisor specializing in Urban Heat Island (UHI) mitigation strategies for Maharashtra, India. 
Provide scientific, actionable advice on UHI reduction, health impacts, and climate adaptation strategies.
Focus on practical solutions like green infrastructure, cool roofs, vegetation, and urban planning.
Always provide detailed, accurate answers based on scientific research and best practices."""
                
                full_prompt = f"{system_context}\n\nUser Question: {request.prompt}\n\nPlease provide a comprehensive, detailed answer:"
                
                response = model.generate_content(full_prompt)
                
                # Extract text from response
                response_text = response.text if hasattr(response, 'text') else str(response)
                
                logger.info(f"Successfully generated response from Gemini using {working_model_name}")
                return ChatResponse(response=response_text)
                
            except Exception as gemini_error:
                logger.error(f"Gemini API error: {gemini_error}", exc_info=True)
                # Fall through to use fallback response instead of raising error
                logger.warning("Falling back to default responses due to Gemini error")
        
        # Use fallback response
        logger.info("Using fallback response")
        prompt_lower = request.prompt.lower()
        if "mumbai" in prompt_lower:
            response_text = fallback_responses["mumbai"]
        elif "pune" in prompt_lower:
            response_text = fallback_responses["pune"]
        elif "ndvi" in prompt_lower:
            response_text = fallback_responses["ndvi"]
        else:
            response_text = fallback_responses["default"]
        
        return ChatResponse(response=response_text)
        
    except Exception as e:
        logger.error(f"Error in AI advisor chat: {e}", exc_info=True)
        # Use fallback even on unexpected errors
        prompt_lower = request.prompt.lower()
        if "mumbai" in prompt_lower:
            response_text = fallback_responses["mumbai"]
        elif "pune" in prompt_lower:
            response_text = fallback_responses["pune"]
        elif "ndvi" in prompt_lower:
            response_text = fallback_responses["ndvi"]
        else:
            response_text = fallback_responses["default"]
        
        return ChatResponse(response=response_text)
