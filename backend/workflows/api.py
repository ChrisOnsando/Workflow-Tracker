from django.utils import timezone
from ninja import Router
from ninja.errors import HttpError

from workflows.models import Application, ApplicationType, Status
from workflows.schemas import (
    ApplicationCreateSchema,
    ApplicationOut,
    ApplicationUpdateSchema,
    ErrorOut,
    ReviewerDecisionSchema,
)

router = Router()

VALID_TYPES = {t.value for t in ApplicationType}

REVIEWER_DECISIONS = {
    Status.APPROVED,
    Status.REJECTED,
    Status.NEED_MORE_INFO,
}


def get_or_404(app_id: int) -> Application:
    try:
        return Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        raise HttpError(404, "Application not found")


@router.post("/", response={201: ApplicationOut, 422: ErrorOut}, tags=["Applications"])
def create_application(request, payload: ApplicationCreateSchema):
    if payload.application_type not in VALID_TYPES:
        raise HttpError(422, f"Invalid application type: {payload.application_type}")

    app = Application.objects.create(**payload.dict())
    return 201, app


@router.get("/", response=list[ApplicationOut], tags=["Applications"])
def list_applications(request):
    return Application.objects.all()


@router.get(
    "/{app_id}",
    response={200: ApplicationOut, 404: ErrorOut},
    tags=["Applications"],
)
def get_application(request, app_id: int):
    return get_or_404(app_id)


@router.patch(
    "/{app_id}",
    response={200: ApplicationOut, 400: ErrorOut, 404: ErrorOut},
    tags=["Applications"],
)
def update_application(request, app_id: int, payload: ApplicationUpdateSchema):
    app = get_or_404(app_id)

    editable_statuses = {Status.DRAFT, Status.NEED_MORE_INFO}

    if app.status not in editable_statuses:
        raise HttpError(
            400,
            f"Applications with status '{app.status}' cannot be edited",
        )

    for field, value in payload.dict(exclude_none=True).items():
        if field == "application_type" and value not in VALID_TYPES:
            raise HttpError(422, f"Invalid application type: {value}")

        setattr(app, field, value)

    app.save()
    return app


@router.post(
    "/{app_id}/submit",
    response={200: ApplicationOut, 400: ErrorOut, 404: ErrorOut},
    tags=["Workflow"],
)
def submit_application(request, app_id: int):
    app = get_or_404(app_id)

    if app.status not in {Status.DRAFT, Status.NEED_MORE_INFO}:
        raise HttpError(
            400,
            "Only Draft or Need More Information applications can be submitted",
        )

    app.status = Status.SUBMITTED
    app.submitted_at = timezone.now()
    app.save()

    return app


@router.post(
    "/{app_id}/start-review",
    response={200: ApplicationOut, 400: ErrorOut, 404: ErrorOut},
    tags=["Workflow"],
)
def start_review(request, app_id: int):
    app = get_or_404(app_id)

    if app.status != Status.SUBMITTED:
        raise HttpError(
            400,
            "Only Submitted applications can be moved to Under Review",
        )

    app.status = Status.UNDER_REVIEW
    app.save()

    return app


@router.post(
    "/{app_id}/decision",
    response={200: ApplicationOut, 400: ErrorOut, 404: ErrorOut},
    tags=["Workflow"],
)
def record_decision(request, app_id: int, payload: ReviewerDecisionSchema):
    app = get_or_404(app_id)

    if app.status != Status.UNDER_REVIEW:
        raise HttpError(
            400,
            "Only Under Review applications can receive a decision",
        )

    if payload.decision not in REVIEWER_DECISIONS:
        raise HttpError(
            400,
            f"Invalid decision. Must be one of: {', '.join([d.value for d in REVIEWER_DECISIONS])}",
        )

    requires_comment = {Status.REJECTED, Status.NEED_MORE_INFO}

    if payload.decision in requires_comment and not payload.comment:
        raise HttpError(
            400,
            f"A comment is required when decision is '{payload.decision}'",
        )

    app.status = payload.decision
    app.reviewer_comment = payload.comment or ""
    app.reviewed_at = timezone.now()
    app.save()

    return app

