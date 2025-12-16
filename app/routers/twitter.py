"""
Twitter/X authentication router (placeholder)
"""
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.common import SuccessResponse
from app.utils.logger import logger
from app.routers.instagram import _build_state

router = APIRouter()


@router.get(
    "/auth",
    response_model=SuccessResponse,
    summary="Twitter auth",
    description="Initiate Twitter/X authentication (placeholder)"
)
async def twitter_auth(
    userId: str = Query(None, alias="userId"),
    token: str = Query(None, alias="token"),
):
    """
    Twitter/X authentication (placeholder).

    NOTE: Replace authUrl with the real Twitter/X OAuth URL.
    """
    try:
        state = _build_state(userId or "unknown", token, "twitter")
        auth_url = f"https://api.twitter.com/oauth/authorize?state={state}"
        return SuccessResponse(
            message="Twitter authentication initiated",
            data={"authUrl": auth_url}
        )
    except Exception as e:
        logger.error(f"Twitter auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate Twitter authentication"
        )

"""
Twitter/X authentication router (placeholder)
"""
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.common import SuccessResponse
from app.utils.logger import logger
from app.routers.instagram import _build_state

router = APIRouter()


@router.get(
    "/auth",
    response_model=SuccessResponse,
    summary="Twitter auth",
    description="Initiate Twitter/X authentication (placeholder)"
)
async def twitter_auth(
    userId: str = Query(None, alias="userId"),
    token: str = Query(None, alias="token"),
):
    """
    Twitter/X authentication (placeholder).

    NOTE: Replace authUrl with the real Twitter/X OAuth URL.
    """
    try:
        state = _build_state(userId or "unknown", token, "twitter")
        auth_url = f"https://api.twitter.com/oauth/authorize?state={state}"
        return SuccessResponse(
            message="Twitter authentication initiated",
            data={"authUrl": auth_url}
        )
    except Exception as e:
        logger.error(f"Twitter auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate Twitter authentication"
        )


