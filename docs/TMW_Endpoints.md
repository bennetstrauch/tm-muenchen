# API Write Endpoints

This documents the three booking-creation endpoints exposed by the `api` app.
(`SurveyAnswersCreate` is intentionally excluded.)

## General notes

- **`phone_number`** must be a valid international number (e.g. `+4366412345678`). If it is present but invalid, it is **silently dropped** and the booking is still created without it.
- **Date fields** (`birthdate`) use the input format `DD.MM.YYYY` (e.g. `24.12.1990`).
- **`source`** defaults to `"unbekannt"` if omitted; pass it to identify where the booking originated (e.g. a campaign or site name).
- **`news_subscribed`** defaults to `false`.

---

## 1. Lecture booking

Book a seat for a lecture (`Vortrag`).
- **URL:** `POST /api/booking`

### Required

| Field        | Type    | Notes                                                      |
|--------------|---------|------------------------------------------------------------|
| `first_name` | string  | max 32 chars                                               |
| `last_name`  | string  | max 64 chars                                               |
| `email`      | string  | valid email                                                |
| `seats`      | integer | number of reserved seats (use 1 for online lectures)       |
| `lecture`    | integer | PK of the lecture; **must be in the future** (else 400)    |

### Optional

| Field             | Type    | Default       | Notes                              |
|-------------------|---------|---------------|------------------------------------|
| `zip_code`        | string  | `""`          | max 12 chars                       |
| `phone_number`    | string  | `""`          | international format; dropped if invalid |
| `news_subscribed` | boolean | `false`       | subscribe to newsletter            |
| `source`          | string  | `"unbekannt"` |                                    |

### Example

```bash
curl -X POST https://tmw.meditation.de/api/booking \
  -H "Authorization: Token <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Maria",
    "last_name": "Huber",
    "email": "maria@example.com",
    "seats": 2,
    "lecture": 42,
    "phone_number": "+4366412345678",
    "news_subscribed": true,
    "source": "https://meditation.de/berlin"
  }'
```

---

## 2. Info booking (info request)

Request information from a center (`Info-Anfrage`).

- **URL:** `POST /api/infobooking`
- **Serializer:** `InfoBookingSerializer`

### Required

| Field        | Type    | Notes                                  |
|--------------|---------|----------------------------------------|
| `first_name` | string  | max 32 chars                           |
| `last_name`  | string  | max 64 chars                           |
| `email`      | string  | valid email                            |
| `center`     | integer | PK of the center the request is for    |

### Optional

| Field             | Type    | Default       | Notes                              |
|-------------------|---------|---------------|------------------------------------|
| `zip_code`        | string  | `""`          | max 12 chars                       |
| `phone_number`    | string  | `""`          | international format; dropped if invalid |
| `message`         | string  | `""`          | free text                          |
| `news_subscribed` | boolean | `false`       | subscribe to newsletter            |
| `source`          | string  | `"unbekannt"` |                                    |

### Example

```bash
curl -X POST https://tmw.meditation.de/api/infobooking \
  -H "Authorization: Token <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Maria",
    "last_name": "Huber",
    "email": "maria@example.com",
    "center": 7,
    "message": "Wann findet der nächste Vortrag statt?"
  }'
```

---

## 3. Course booking

Book a course slot (`Kursbuchung`).

- **URL:** `POST /api/coursebooking`
- **Serializer:** `CourseBookingSerializer`

### Required

| Field        | Type    | Notes                                                       |
|--------------|---------|-------------------------------------------------------------|
| `slot`       | integer | PK of the course slot; the course **must not be in the past** (else 400) |
| `first_name` | string  | max 32 chars                                                |
| `last_name`  | string  | max 64 chars                                                |
| `email`      | string  | valid email                                                 |
| `gender`     | string  | one of `M` (männlich), `F` (weiblich), `X` (divers)         |
| `birthdate`  | string  | date in `DD.MM.YYYY` format                                 |

### Optional

| Field             | Type    | Default       | Notes                              |
|-------------------|---------|---------------|------------------------------------|
| `phone_number`    | string  | `""`          | international format; dropped if invalid |
| `address1`        | string  | `""`          | max 256 chars                      |
| `address2`        | string  | `""`          | max 256 chars                      |
| `zip_code`        | string  | `""`          | max 12 chars                       |
| `city`            | string  | `""`          | max 256 chars                      |
| `message`         | string  | `""`          | free text                          |
| `news_subscribed` | boolean | `false`       | subscribe to newsletter            |
| `source`          | string  | `"unbekannt"` |                                    |

### Example


```bash
curl -X POST https://tmw.meditation.de/api/coursebooking \
  -H "Authorization: Token <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "slot": 123,
    "first_name": "Maria",
    "last_name": "Huber",
    "email": "maria@example.com",
    "gender": "F",
    "birthdate": "24.12.1990",
    "city": "Wien",
    "zip_code": "1010",
    "phone_number": "+4366412345678"
  }'
```
