# Prompt Template for FindEg.com Updates

Use this template to structure your requests for new features, components, or pages. Providing clear and organized information will help in understanding your requirements accurately and delivering the best possible result.

---

## 1. Request for a New Feature

- **Feature Name:** (A short, descriptive name for the feature)
- **Description:** (Provide a detailed overview of what the feature is and what it should do. What problem does it solve?)
- **User Stories:** (Describe the feature from a user's perspective.)
  - *As a [type of user], I want to [perform some task] so that I can [achieve some goal].*
  - *Example: As a customer, I want to filter products by brand so that I can find items from my favorite manufacturer.*
- **UI/UX Design Notes:** (Describe the desired look and feel. You can mention visual styles, animations, or inspiration from other websites.)
- **Key Requirements & Acceptance Criteria:** (List specific, testable criteria that must be met for the feature to be considered complete.)
  - *Example: The price filter must be a range slider.*
  - *Example: The feature must be fully responsive and work on mobile.*
  - *Example: All text must be internationalized for both English and Arabic.*

---

## 2. Request for a New Component

- **Component Name:** (e.g., `NewsletterSignupForm`, `CountdownTimer`)
- **Purpose:** (What is the primary function of this component? Where will it be used?)
- **Props (Inputs):** (What data does this component need to receive to function correctly?)
  - `propName` (`type`): Description of the prop.
  - *Example: `title` (`string`): The main heading for the component.*
- **State (Internal Data):** (What internal data does the component need to manage?)
  - *Example: Manages the `email` input value and a `submissionStatus` (idle, loading, success, error).*
- **Visual Appearance:** (Describe how the component should look in different states - default, hover, active, disabled. Mention colors, fonts, spacing from the theme.)
- **Interactivity:** (Describe what happens when the user interacts with the component. e.g., button clicks, form submissions.)

---

## 3. Request for a New Page

- **Page Name:** (e.g., `User Profile`, `Order History`)
- **URL / Route:** (What should the URL for this page be? e.g., `/profile`)
- **Purpose:** (What is the main goal of this page?)
- **Page Sections:** (Break down the page into logical sections or components.)
  - **Section 1: [Name]**
    - *Content:* (What information or components go here?)
    - *Layout:* (How should this section be structured? e.g., two-column grid)
  - **Section 2: [Name]**
    - ...
- **Data Requirements:** (What data needs to be displayed on this page? Where does it come from?)
- **Interactivity:** (Describe any key user interactions on the page, like form submissions or navigation between sections.)

---

## 4. Request to Update an Existing Feature/Component/Page

- **Name of Item to Update:** (e.g., `Footer`, `ProductCard`, `ShopPage`)
- **Reason for Update:** (Explain why the change is needed. Is it a bug fix, a UX improvement, a visual tweak?)
- **Description of Changes:** (Clearly list the specific changes required.)
  - *Example 1: In the Footer, change the background color to the primary brand color and add social media icons.*
  - *Example 2: On the ShopPage, implement the functionality for the sort dropdown menu.*
  - *Example 3: Fix the navigation link bug in the Header that causes a crash.*
- **Expected Outcome:** (Describe how the feature should behave or look after the changes are applied.)