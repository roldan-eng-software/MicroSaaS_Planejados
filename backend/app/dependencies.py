# app/dependencies.py
import uuid
from fastapi import Depends, Request, HTTPException

async def get_current_tenant_id(request: Request) -> uuid.UUID:
    """Extrai tenant_id do request injetado pelo middleware"""
    if not hasattr(request.state, "tenant_id"):
        # This could happen for public endpoints, handle gracefully
        # Or enforce authentication on all routes that use this dependency
        raise HTTPException(status_code=401, detail="Not authenticated or tenant not found")
    return request.state.tenant_id

async def get_current_user_id(request: Request) -> uuid.UUID:
    """Extrai user_id do request"""
    if not hasattr(request.state, "user_id"):
        raise HTTPException(status_code=401, detail="Not authenticated or user not found")
    return request.state.user_id
