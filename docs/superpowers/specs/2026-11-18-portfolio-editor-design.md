# Portfolio text editor and GitHub Pages

## Intent
Kevin wants to maintain the portfolio's wording through a browser form and publish the existing site on GitHub Pages. Keep the current layout, styling, Vid2Tab demo, crossword player, and empty crossword message.

## Approach
Kevin selected Pages CMS over Decap CMS. Pages CMS edits structured files in a GitHub repository without a separate content database. Decap would require additional authentication configuration; direct file editing would keep code-like syntax in Kevin's workflow. A custom dashboard would add unnecessary maintenance.

## Editable content
Provide clearly labeled forms for homepage introduction, about text, footer text, Vid2Tab title/status/description/tags/detail paragraphs and captions, TeachLA title/status/description/details, and crossword introduction/empty-state wording. Preserve existing copy initially. Use plain-text fields and safely escape values when generating HTML. Styling and new kinds of sections remain code changes. Adding projects or replacing demo media is outside this text-maintenance setup.

## Publishing
Use a public repository named `kevincoj.github.io` and publish the static build through GitHub Actions. Saving in Pages CMS commits content to GitHub and triggers validation, build, and deployment. Generated pages include content in HTML without needing browser-side content loading. A failed validation/build must leave the last successful deployment available.

Publish only website assets, not backend secrets, development tools, or test fixtures. Keep Supabase separate. The crossword catalog stays empty; completion submissions are not part of this change and will need the final origin allowed and a real-puzzle smoke test before launch.

## Owner workflow
Open Pages CMS, sign in with GitHub, select the portfolio repository and the desired form, edit text, then Save. The live site updates after a successful Actions run. Git history provides recovery. Kevin authorizes the Pages CMS GitHub App only for the portfolio repository; no credentials are shared in chat.

## Migration and validation
Keep the existing public Sites URL available during migration. Verify the generated content, HTML escaping, unchanged project media behavior, empty crossword state, automated deployment, and public GitHub Pages URL. Provide the live URL, repository URL, editor link, and brief editing instructions. Keep one primary publishing workflow on GitHub so CMS edits do not depend on Codex.

## Implementation choices
Reuse the current static site and Node build script. Store editable text separately from templates and configure `.pages.yml` with descriptive labels. No framework migration, visitor login, new project features, domain purchase, or styling redesign.
