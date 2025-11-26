# Implementation Plan - Robust API Route Update

## Goal Description
Update `src/app/api/generate-plan/route.tsx` with a more robust implementation provided by the user. This new version includes comprehensive error handling, type safety checks for PDF generation, input validation, and improved prompt engineering to prevent JSON parsing errors and application crashes.

## User Review Required
> [!IMPORTANT]
> This update replaces the entire API route logic. It changes the email sender to `onboarding@resend.dev` for better deliverability during development.

## Proposed Changes

### Backend
#### [MODIFY] [route.tsx](file:///c:/Users/Leftcheek7/fitness-wizard/src/app/api/generate-plan/route.tsx)
- Replace the current implementation with the user-provided code.
- Key improvements:
    - **Null Checks**: Extensive optional chaining and default values for all data fields.
    - **Type Safety**: Explicit string conversion for PDF text nodes to prevent rendering errors.
    - **Input Validation**: Checks for valid JSON body and required fields.
    - **Error Handling**: Granular try/catch blocks for AI parsing, PDF generation, and email sending.
    - **Fallback Logic**: Better fallback structure if AI JSON parsing fails.

## Verification Plan

### Automated Tests
- None available for this specific API route.

### Manual Verification
1.  **Generate a Plan**: Use the frontend wizard to generate a new fitness plan.
2.  **Verify PDF**: Check if the PDF is generated and downloadable without errors.
3.  **Verify Email**: Check console logs for "Email sent successfully" (or error message if API key is invalid, but app should not crash).
4.  **Check Logs**: Monitor the terminal for the new structured logs (e.g., "📋 Generating plan for...", "✅ AI Plan parsed successfully").
