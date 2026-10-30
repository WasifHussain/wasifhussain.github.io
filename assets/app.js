(() => {
    "use strict";

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];
    const header = $(".site-header");
    const menu = $(".menu-toggle");
    const nav = $("#primary-nav");
    const mobile = window.matchMedia("(max-width: 620px)");

    function closeMenu(restoreFocus = false) {
        nav.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
        if (restoreFocus) menu.focus();
    }

    menu.addEventListener("click", () => {
        const isOpen = menu.getAttribute("aria-expanded") === "true";
        menu.setAttribute("aria-expanded", String(!isOpen));
        nav.classList.toggle("open", !isOpen);
    });
    nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("click", (event) => {
        if (!header.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            menu.getAttribute("aria-expanded") === "true"
        ) {
            closeMenu(true);
        }
    });
    mobile.addEventListener("change", () => {
        if (!mobile.matches) closeMenu();
    });

    const cards = $$(".project-card");
    $$(".filter-button").forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            let count = 0;
            cards.forEach((card) => {
                const matches =
                    filter === "all" ||
                    card.dataset.category.split(/\s+/).includes(filter);
                card.hidden = !matches;
                if (matches) count += 1;
            });
            $$(".filter-button").forEach((item) => {
                const selected = item === button;
                item.classList.toggle("active", selected);
                item.setAttribute("aria-pressed", String(selected));
            });
            const label = filter === "all" ? "all" : button.textContent.trim();
            $("#filter-status").textContent =
                `Showing ${count} ${label} project${count === 1 ? "" : "s"}.`;
        });
    });

    const projects = {
        healthcare: {
            category: "PROFESSIONAL WORK · HEALTHCARE INTEROPERABILITY",
            title: "Connecting clinical systems",
            description:
                "Backend engineering for Qure4u's patient-engagement and clinical-workflow platform, connecting healthcare systems through Java microservices and standards-based APIs.",
            points: [
                "Developed Java 21 and Spring Boot microservices and REST APIs for patient engagement and clinical workflows.",
                "Integrated Cerner and Athenahealth EHR systems with FHIR R4 data mappings aligned with HL7 FHIR standards.",
                "Built asynchronous workflows with RabbitMQ and Apache Camel, managed Flyway migrations, and tested with JUnit 5, Mockito, and AssertJ.",
            ],
            stack: "Java 21 · Spring Boot · FHIR R4 · RabbitMQ · Apache Camel",
            url: "https://www.qure4u.com/",
            link: "About Qure4u",
            credit: "Qure4u Inc. · Contract Software Engineer · July 2024–March 2026. Professional contribution to the platform.",
        },
        prizm: {
            category: "PROFESSIONAL WORK · HEALTHCARE DATA",
            title: "Search behind the healthcare data",
            description:
                "Software engineering for PRIZM at Deerhold, a US healthcare data and analytics platform for patient and provider information.",
            points: [
                "Contributed to development of PRIZM's healthcare data and analytics platform.",
                "Worked with Elasticsearch for large-scale indexing and search, applying test-driven development to features and fixes.",
                "Built and maintained Jenkins CI/CD pipelines and collaborated on iterative releases within Agile teams.",
            ],
            stack: "Elasticsearch · Test-driven development · Jenkins · CI/CD",
            url: "https://deerhold.com/",
            link: "About Deerhold",
            credit: "Deerhold Ltd. · Software Engineer · February 2024–July 2026. Work delivered within an Agile team.",
        },
        namaste: {
            category: "PROFESSIONAL WORK · WEBSITE DEVELOPMENT",
            title: "Namaste Roving",
            description:
                "Website development work for Namaste Roving through Astra Technology, where I worked as a Software Engineer.",
            points: [
                "Contributed to the Namaste Roving website through Astra Technology.",
                "Worked as a Software Engineer on the agency's website projects.",
            ],
            stack: "Website development · Agency project",
            url: "https://namasteroving.com/",
            link: "Visit Namaste Roving",
            credit: "Astra Technology · Software Engineer. Website work contributed through the agency.",
            creditUrl: "https://astratechnology.com.np/portfolio/5",
            creditLink: "View Astra's project reference",
        },
        restaurant: {
            category: "APPLIED MACHINE LEARNING",
            title: "Restaurant Recommendation System",
            description:
                "A Django application that uses cosine similarity to help people find restaurants aligned with their preferences.",
            points: [
                "Developed a recommendation model using cosine similarity.",
                "Connected the recommendation approach to a Django web application.",
                "Worked with restaurant data to produce relevant suggestions.",
            ],
            stack: "Python · Django · Cosine similarity",
            url: "https://github.com/WasifHussain/RestaurantRecommender",
            link: "View source on GitHub",
            credit: "Selected project · Restaurant recommendations with cosine similarity.",
        },
        ordering: {
            category: "FULL-STACK WEB DEVELOPMENT",
            title: "Online Food Ordering System",
            description:
                "A semester project connecting restaurant and order data with an online ordering flow and Stripe payments. The public repository currently contains project notes.",
            points: [
                "Built a web-based food-ordering system in PHP.",
                "Designed a database for restaurant and order information.",
                "Integrated Stripe for payment processing.",
            ],
            stack: "PHP · Database design · Stripe",
            url: "https://github.com/WasifHussain/Food-Ordering-System-Repo",
            link: "Read project notes",
            credit: "Semester project · The public repository currently contains project notes.",
        },
        tutor: {
            category: "MOBILE DEVELOPMENT + APPLIED ML",
            title: "Tutor Hiring Application",
            description:
                "An Android application that helps learners connect with tutors, arrange payments, and draw useful signals from reviews.",
            points: [
                "Built tutor-matching functionality with Java, Android, and Firebase.",
                "Integrated the Khalti API for payments.",
                "Added sentiment analysis of user reviews.",
            ],
            stack: "Java · Android · Firebase · Khalti API",
            url: "https://github.com/WasifHussain/TutorHiringApp",
            link: "View source on GitHub",
            credit: "Selected project · Android tutor matching, payments, and review sentiment analysis.",
        },
    };
    const dialog = $(".project-dialog");
    let dialogTrigger = null;

    if (typeof dialog.showModal === "function") {
        $$(".project-details").forEach((button) => {
            button.addEventListener("click", () => {
                const project = projects[button.dataset.project];
                if (!project) return;
                dialogTrigger = button;
                $("#dialog-category").textContent = project.category;
                $("#dialog-title").textContent = project.title;
                $("#dialog-description").textContent = project.description;
                const credit = $("#dialog-credit");
                if (credit) {
                    credit.replaceChildren(
                        document.createTextNode(project.credit || ""),
                    );
                    if (project.creditUrl) {
                        const reference = document.createElement("a");
                        reference.href = project.creditUrl;
                        reference.textContent = project.creditLink;
                        reference.target = "_blank";
                        reference.rel = "noopener noreferrer";
                        reference.setAttribute(
                            "aria-label",
                            `${project.creditLink} (opens in a new tab)`,
                        );
                        credit.append(document.createTextNode(" "), reference);
                    }
                    credit.hidden = !project.credit;
                }
                $("#dialog-points").replaceChildren(
                    ...project.points.map((point) => {
                        const item = document.createElement("li");
                        item.textContent = point;
                        return item;
                    }),
                );
                $("#dialog-stack").textContent = project.stack;
                const link = $("#dialog-link");
                link.classList.add("project-link");
                link.href = project.url;
                const arrow = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg",
                );
                arrow.setAttribute("class", "arrow-icon");
                arrow.setAttribute("viewBox", "0 0 24 24");
                arrow.setAttribute("fill", "none");
                arrow.setAttribute("aria-hidden", "true");
                const arrowPath = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path",
                );
                arrowPath.setAttribute("d", "m5 19 14-14M5 5h14v14");
                arrowPath.setAttribute("stroke", "currentColor");
                arrowPath.setAttribute("stroke-width", "1.5");
                arrowPath.setAttribute("stroke-linecap", "round");
                arrowPath.setAttribute("stroke-linejoin", "round");
                arrow.append(arrowPath);
                link.replaceChildren(
                    document.createTextNode(project.link),
                    arrow,
                );
                link.setAttribute(
                    "aria-label",
                    `${project.link} (opens in a new tab)`,
                );
                dialog.showModal();
                document.body.classList.add("dialog-open");
                $(".dialog-close").focus();
            });
        });
        $(".dialog-close").addEventListener("click", () => dialog.close());
        let pointerStartedOutside = false;
        function outsideDialog(event) {
            const bounds = dialog.getBoundingClientRect();
            return (
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom
            );
        }
        dialog.addEventListener("pointerdown", (event) => {
            pointerStartedOutside = outsideDialog(event);
        });
        dialog.addEventListener("click", (event) => {
            if (pointerStartedOutside && outsideDialog(event)) dialog.close();
            pointerStartedOutside = false;
        });
        dialog.addEventListener("close", () => {
            document.body.classList.remove("dialog-open");
            dialogTrigger?.focus();
            dialogTrigger = null;
        });
    } else {
        $$(".project-details").forEach((button) => {
            button.hidden = true;
        });
    }

    const toast = $(".toast");
    let toastTimer;
    function showToast(message, duration = 4000) {
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add("visible");
        toastTimer = window.setTimeout(() => {
            toast.classList.remove("visible");
        }, duration);
    }

    function legacyCopy(email) {
        const input = document.createElement("textarea");
        input.value = email;
        input.setAttribute("aria-label", "Email address to copy");
        input.style.cssText = "position:fixed;left:-9999px;top:0;";
        document.body.append(input);
        input.select();
        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch {
            /* Offer manual copy below. */
        }
        input.remove();
        return copied;
    }

    $(".copy-email").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        const email = $(".email-link").href.replace(/^mailto:/, "");
        let copied = false;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(email);
                copied = true;
            }
        } catch {
            /* Clipboard permissions vary; try the local fallback. */
        }
        if (!copied) copied = legacyCopy(email);
        button.focus({ preventScroll: true });
        if (copied) {
            showToast("Email address copied. Let’s talk!");
        } else {
            showToast(`Copy this email address: ${email}`, 20000);
            toast.style.userSelect = "text";
            toast.tabIndex = 0;
            toast.focus({ preventScroll: true });
            const range = document.createRange();
            range.selectNodeContents(toast);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    $("#year").textContent = String(new Date().getFullYear());

    if ("IntersectionObserver" in window) {
        const links = $$('#primary-nav a[href^="#"]');
        const visibility = new Map();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) =>
                    visibility.set(
                        entry.target.id,
                        entry.isIntersecting ? entry.intersectionRatio : 0,
                    ),
                );
                const current = [...visibility.entries()].sort(
                    (a, b) => b[1] - a[1],
                )[0];
                links.forEach((link) => {
                    if (current?.[1] > 0 && link.hash === `#${current[0]}`) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            },
            {
                rootMargin: "-10% 0px -25% 0px",
                threshold: [0, 0.1, 0.25, 0.5, 0.75],
            },
        );
        links.forEach((link) => {
            const section = document.querySelector(link.hash);
            if (section) observer.observe(section);
        });
    }

    document.body.classList.add("js-ready");
})();
