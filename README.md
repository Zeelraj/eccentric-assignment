# eccentric-assignment

This is the coding round assignment for the NodeJS developer role at Eccentric Engine

## Client

Visit [Demo](https://schedularapp.netlify.app).

### Schedule Calendar

- User will get the calendar with all the meetings.
  - User can switch between "All Meetings" and "Active Meetings", as well.
- User can also schedule the meeting by selecting the desired time slot on the calendar.
- User can update the meeting by selected the meeting from the calendar.
- User will get different views for the calendar.
  - Month, Week, Day views
  - Agenda wise view
- Off hours of the user will be displayed for present day.

### Meetings

- User can schedule new meetings from this section.
  - "Schedule Meeting" button
- User will get the list of all the meetings fro her/is.
  - User can switch between "All Meetings" and "Active Meetings", as well.
- User can perform different actions as well for each meeting.
  - Update Meeting
  - Cancel Meeting
  - Delete Meeting

### Meeting Invitation

- Once user schedule's the meeting with other user, the guest will be displayed the invitation for the meeting.
- Guest can accept or reject the invitation based on her/is schedule.
- If guest accepts the invitation, but her/is slot will not be available then invitation will be rejected automatically.

### Profile

- User can update her/is name and password.
  - While updating password, password recovery question's answer will be required
- User can also mark her/is off hours.
  - During this hours of each day, user will not be available for meeting.

## Server

Visit [Backend Server](https://tiny-tan-sea-urchin-tux.cyclic.app/api).

### Auth APIs

- This APIs manages the authentication and authorization of the app

#### APIS

- /v1/auth/register

  - Sign up user

    ```js
    method = POST;

    payload = {
      name: String,
      email: String,
      password: String,
      cnfPassword: String,
      passwordRecovery: {
        question: String,
        answer: String,
      },
    };
    ```

- /v1/auth/login

  - Sing in user

    ```js
    Method = POST;

    payload = {
      email: String,
      password: String,
    };
    ```

- /v1/auth/logout

  - Logs out user

    ```js
    Method = GET;
    ```

- /v1/auth/authenticate

  - Authenticates logged in user

    ```js
    Method = GET;
    ```

- /v1/auth/password/reset

  - Update user password

    ```js
    Method = PUT;

    payload = {
      email: String,
      answer: String,
      password: String,
      cnfPassword: String,
    };
    ```

### User APIs

- This APIs manages the user related operations

#### APIS

- /v1/user

  - Fetch user details

    ```js
    Method = PUT;

    params = {
      userId: String,
    };
    ```

- /v1/users

  - List of all the users

  ```js
  Method = GET;
  ```

- /v1/user/update

  - Update logged in user's details

    ```js
    Method = PUT;

    payload = {
      name: String,
      blockedTimeSlots: {
        time: {
          start: String,
          end: String,
        },
      },
    };
    ```

- /v1/user/deactivate

  - Deactivate's logged in user

  ```js
  Method = DELETE;
  ```

- /v1/user/delete

  - Delete's logged in user

  ```js
  Method = DELETE;
  ```

### Meeting APIs

- This APIs manages the meeting and invitation related operations

#### APIS

- /v1/meeting/create

  - Create's new meeting for logged in user
  - Method: POST

    ```js
    payload = {
      title: String,
      agenda: String,
      time: {
        start: String,
        end: String,
      },
      guest: ObjectId,
    };
    ```

- /v1/meeting

  - Fetch meeting details

    ```js
    Method = GET;

    params = {
      meetingId: String,
    };
    ```

- /v1/meetings

  - List of all the meetings of the user

    ```js
    Method = GET

    params = {
        userId: String;
    }
    ```

- /v1/meeting/update

  - Update meeting's details.

    - If time slot is updated then guest will be sent invitation again and s/he have to accept it again for th updated time.

    ```js
    Method = PUT

    params = {
        meetingId: String,
    };

    payload = {
        title?: String,
        agenda?: String,
        time?: {
            start: String,
            end: String,
        },
    };
    ```

- /v1/meeting/cancel

  - Cancel's meeting

    ```js
    Method = DELETE

    params = {
        meetingId: String;
    }
    ```

- /v1/meeting/delete

  - Delete's meeting

  ```js
    Method = DELETE

    params = {
        meetingId: String;
    }
  ```

- /v1/meeting/invitation/update-status

  - Update meeting's invitation.

    - Guest can accept or reject the meeting invitation.
    - If user will not be available for the selected time slot then invitation will be automatically rejected.

    ```js
    Method = PUT;

    params = {
      meetingId: String,
    };

    payload = {
      status: String,
    };
    ```

## Demo Users

### Demo User 1

Email: zeelrajsinh.mahida@gmail.com <br/>
Password: zrsmahida

### Demo User 2

Email: zeelmahida123@gmail.com <br/>
Password: zrsmahida2
