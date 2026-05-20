from django.contrib import admin
from workflows.models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "tracking_number",
        "applicant_name",
        "company_name",
        "application_type",
        "status",
        "created_at",
        "submitted_at",
        "reviewed_at",
    )

    list_filter = (
        "status",
        "application_type",
        "created_at",
    )

    search_fields = (
        "tracking_number",
        "applicant_name",
        "applicant_email",
        "company_name",
    )

    readonly_fields = (
        "tracking_number",
        "created_at",
        "updated_at",
        "submitted_at",
        "reviewed_at",
    )

    ordering = ("-created_at",)

    fieldsets = (
        ("Applicant Details", {
            "fields": (
                "tracking_number",
                "applicant_name",
                "applicant_email",
                "company_name",
            )
        }),
        ("Application Info", {
            "fields": (
                "application_type",
                "description",
                "status",
            )
        }),
        ("Review Info", {
            "fields": (
                "reviewer_comment",
                "submitted_at",
                "reviewed_at",
            )
        }),
        ("System Info", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )
