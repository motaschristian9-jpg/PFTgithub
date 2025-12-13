import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation Resources
// For a production app, these would be in separate public/locales/{lang}/translation.json files
// But for this PoC, bundling them here ensures immediate success without network fetching issues.
const resources = {
  en: {
    translation: {
      landing: {
        hero: {
          version: "v2.0 is now live",
          title: "Master Your Money,",
          highlight: "Effortlessly.",
          subtitle: "Track, Save, and Grow your wealth with our intuitive financial tools.",
          cta: "Get Started Free",
          secondaryCta: "See how it works",
          lovedBy: "Loved by 10,000+ users",
          card: {
              totalBalance: "Total Balance",
              savingsGoal: "Savings Goal",
              budgetStatus: "Budget Status",
              onTrack: "On Track"
          }
        },
        features: {
          title: "Everything you need to",
          highlight: "build wealth.",
          subtitle: "Powerful tools to help you take control of your financial future, packaged in a simple, intuitive interface.",
          items: {
            dashboard: { title: "Interactive Dashboard", desc: "Get a bird's-eye view of your finances. Track income, expenses, and savings in real-time." },
            budgeting: { title: "Smart Budgeting", desc: "Set monthly limits for every category. We'll track your spending and alert you when you're close to your limit." },
            goals: { title: "Goal Tracking", desc: "Create custom savings goals for your dreams. Track your progress and reach your targets faster." },
            reports: { title: "Detailed Reports", desc: "Analyze your spending habits with comprehensive breakdowns and exportable reports." }
          }
        },
        testimonials: {
            title: "Loved by",
            highlight: "thousands",
            subtitle: "Don't just take our word for it. Here's what our community has to say.",
            items: [
                {name: "Sarah Johnson", role: "Freelance Designer", quote: "MoneyTracker completely transformed how I manage my freelance income. The tax estimation feature is a lifesaver!"},
                {name: "Michael Chen", role: "Software Engineer", quote: "The cleanest budgeting app I've ever used. No clutter, just the insights I need to grow my savings."},
                {name: "Emily Davis", role: "Small Business Owner", quote: "I finally understand where my money is going. The visual reports are stunning and so easy to understand."}
            ]
        },
        currencySymbol: "$",
        nav: {
          login: "Login",
          signup: "Sign Up",
          menu: {
            features: "Features",
            testimonials: "Testimonials",
            faq: "FAQ"
          }
        },
        security: {
          badge: "Bank-Grade Security",
          title: "Your data is safe",
          highlight: "and sound.",
          subtitle: "We take security seriously. From the moment you sign up, your financial data is protected by industry-leading security protocols.",
          items: [
            { title: "Secure Authentication", desc: "Powered by Laravel Sanctum for robust token-based protection." },
            { title: "Password Hashing", desc: "Passwords are hashed using Bcrypt/Argon2 standards. We never see your password." },
            { title: "Data Privacy", desc: "Your data belongs to you. We never sell or share your personal information." }
          ],
          card: {
            statusTitle: "Security Status",
            status: "Active & Monitored",
            encryption: "Encryption",
            database: "Database",
            isolated: "Isolated & Protected",
            backups: "Backups",
            daily: "Daily Encrypted"
          }
        },
        roadmap: {
          title: "Building for the",
          highlight: "future",
          subtitle: "We're constantly improving. Here's what's coming next to MoneyTracker.",
          items: [
            { quarter: "Q1 2026", title: "Data Export", desc: "Download your complete financial history in CSV and PDF formats for tax season.", status: "In Progress" },
            { quarter: "Q2 2026", title: "Recurring Transactions", desc: "Set up automated recurring income and expenses so you never have to enter bills manually.", status: "Planned" },
            { quarter: "Q3 2026", title: "Multi-Currency", desc: "Track assets in USD, PHP, and CNY with real-time conversion rates.", status: "Planned" }
          ]
        },
        faq: {
          title: "Frequently Asked Questions",
          subtitle: "Got questions? We've got answers.",
          items: [
            { question: "Is MoneyTracker really free?", answer: "Yes! Our core features are completely free forever. We also offer a Premium plan for power users who need advanced automation and unlimited history." },
            { question: "Is my financial data safe?", answer: "We prioritize your security. Your password is securely hashed using industry standards, and we never sell your personal information to third parties." },
            { question: "Can I export my data?", answer: "Yes, you can export your transaction history and reports to CSV or PDF formats at any time." },
            { question: "Does it connect to my bank account?", answer: "Currently, we focus on manual entry for maximum privacy and control, but we are working on optional bank syncing for the near future." }
          ]
        },
        cta_section: {
          title: "Ready to take control?",
          subtitle: "Join thousands of users who are building a better financial future with MoneyTracker.",
          button: "Create Free Account",
          disclaimer: "No credit card required • Free forever plan available"
        },
        footer: {
          description: "The smartest way to manage your personal finances. Built with security and simplicity in mind.",
          headers: {
            product: "Product",
            company: "Company"
          },
          links: {
            features: "Features",
            security: "Security",
            roadmap: "Roadmap",
            about: "About",
            careers: "Careers",
            blog: "Blog",
            contact: "Contact",
            privacy: "Privacy Policy",
            terms: "Terms of Service"
          },
          copyright: "© 2025 MoneyTracker. All rights reserved."
        }
      },
      common: {
        backToHome: "Back to Home"
      },
      app: {
        sidebar: {
          overview: "Overview",
          tracking: "Tracking",
          management: "Management",
          insights: "Insights",
          system: "System",
          items: {
            dashboard: "Dashboard",
            transactions: "Transactions",
            budgets: "Budgets",
            savings: "Savings",
            reports: "Reports",
            settings: "Settings"
          }
        },
        topbar: {
          notifications: "Notifications",
          noNotifications: "No new notifications",
          justNow: "Just now",
          accountSettings: "Account Settings",
          signOut: "Sign out",
          logoutModal: {
            title: "Log out?",
            text: "Are you sure you want to end your session?",
            confirm: "Log out"
          }
        },
        footer: {
          rights: "All rights reserved",
          followUs: "Follow us:"
        },
        dashboard: {
          welcome: "Welcome back, {{name}}",
          stats: {
            income: "Total Income",
            expenses: "Total Expenses",
            netBalance: "Net Balance",
            totalSavings: "Total Savings"
          },
          charts: {
            title: "Financial Overview",
            subtitle: "Income, Expense & Savings (Last 7 Days)",
            income: "Income",
            expense: "Expense",
            savings: "Savings"
          },
          recentActivity: {
            title: "Recent Activity",
            subtitle: "Latest transactions",
            noTransactions: "No recent transactions",
            syncing: "Syncing..."
          },
          budgets: {
            title: "Active Budgets",
            subtitle: "Spending limits",
            noBudgets: "No active budgets. Set limits to track spending.",
            limit: "Limit",
            overBy: "Over by",
            left: "left"
          },
          savings: {
            title: "Savings Goals",
            subtitle: "Track your dreams",
            noGoals: "No active savings goals. Start saving for your dreams.",
            target: "Target"
          }
        },
        transactions: {
            header: {
              title: "Transactions",
              subtitle: "Manage your financial records",
              addBtn: "Add Transaction",
              importBtn: "Import",
              exportBtn: "Export"
            },
            stats: {
              totalIncome: "Total Income",
              totalExpenses: "Total Expenses",
              netBalance: "Net Balance"
            },
            filters: {
              searchPlaceholder: "Search transactions...",
              filterBtn: "Filters",
              clearBtn: "Clear",
              categoryPlaceholder: "All Categories",
              type: {
                all: "All Types",
                income: "Income",
                expense: "Expense"
              },
              date: {
                all: "All Time",
                today: "Today",
                yesterday: "Yesterday",
                last7: "Last 7 Days",
                last30: "Last 30 Days",
                thisMonth: "This Month",
                lastMonth: "Last Month",
                custom: "Custom Range",
                sortByDate: "Sort by Date",
                sortByAmount: "Sort by Amount",
                sortByCreated: "Sort by Created"
              }
            },
            table: {
              title: "Transaction History",
              subtitle: "All Transactions",
              headers: {
                date: "Date",
                category: "Category",
                description: "Name & Description",
                amount: "Amount",
                type: "Type",
                actions: "Actions"
              },
              empty: "No transactions found",
              syncing: "Syncing...",
              editingDisabled: "Editing disabled after 1 hour",
              editTooltip: "Edit Transaction",
              prev: "Previous",
              next: "Next",
              page: "Page",
              of: "of",
              actions: {
                edit: "Edit",
                delete: "Delete"
              }
            },
            modal: {
              titleNew: "New Transaction",
              titleEdit: "Edit Transaction",
              income: "Income",
              expense: "Expense",
              date: "Date",
              category: "Category",
              description: "Description",
              namePlaceholder: "What is this for?",
              notePlaceholder: "Add a note (optional)",
              save: "Save Changes",
              add: "Add Transaction",
              required: "Required",
              noteTime: "Note: Transactions can only be edited within 1 hour of creation.",
              selectCategory: "Select",
              allocateSavings: "Allocate to Savings",
              selectGoal: "Select Goal",
              chooseGoal: "Choose a goal...",
              progress: "Progress:",
              amount: "Amount",
              percent: "Percent (%)",
              budgetStatus: {
                over: "Over",
                onTrack: "On Track",
                spent: "spent",
                left: "left"
              }
            }
            },
        budgets: {
          header: {
            title: "Budgets",
            subtitle: "Plan, track, and save for your future",
            createBtn: "Create Budget"
          },
          stats: {
            activeAllocated: "Active Allocated",
            historyAllocated: "History Allocated",
            activeSpent: "Active Spent",
            historySpent: "History Spent",
            activeCount: "Active Count",
            historyCount: "History Count"
          },
          filters: {
            searchPlaceholder: "Search budgets...",
            activeTab: "Active",
            historyTab: "History",
            allCategories: "All Categories",
            sortBy: {
              newest: "Newest First",
              endDate: "End Date",
              amount: "Amount",
              name: "Name"
            },
            ascending: "Ascending",
            descending: "Descending"
          },
          list: {
            emptyTitle: "No active budgets found",
            emptyDesc: "Try adjusting your filters or create a new budget to start tracking.",
            allocated: "Allocated",
            spent: "Spent",
            viewDetails: "View Details",
            noActive: "No active budgets found"
          },
          history: {
            title: "Budget History",
            subtitle: "Completed & Expired",
            headers: {
              name: "Name",
              category: "Category",
              allocated: "Allocated",
              spent: "Spent",
              status: "Status",
              actions: "Actions"
            },
            loading: "Loading history...",
            empty: "No budget history found matching your filters.",
            previous: "Previous",
            next: "Next",
            page: "Page",
            of: "of"
          },
          modal: {
            titleNew: "New Budget",
            titleEdit: "Edit Budget",
            limitLabel: "Budget Limit",
            nameLabel: "Budget Name",
            namePlaceholder: "e.g., Monthly Groceries",
            descriptionPlaceholder: "Add a note (optional)",
            categoryLabel: "Category",
            selectCategory: "Select a category",
            startDateLabel: "Start Date",
            endDateLabel: "End Date",
            duration: "Duration:",
            createBtn: "Create Budget",
            updateBtn: "Update Budget",
            activeCategory: "(Active)",
            validation: {
              amountRequired: "Amount is required",
              amountMin: "Must be greater than 0",
              nameRequired: "Name is required",
              nameMax: "Max 100 characters",
              categoryRequired: "Category is required",
              endDateRequired: "End date is required",
              endDatePast: "Cannot be in the past",
              endDateBeforeStart: "Must be after start date"
            },
            saving: "Saving...",
            durationValues: {
              invalid: "Invalid duration",
              day: "Day",
              days: "Days"
            }
          },
          card: {
            expired: "Expired",
            overview: "Overview",
            history: "History",
            overBudgetBy: "Over Budget By",
            remainingBudget: "Remaining Budget",
            criticalOverspend: "Critical Overspend",
            used: "used",
            allocated: "Allocated",
            spent: "Spent",
            note: "Note",
            historyTitle: "Transaction History",
            loadingHistory: "Loading transactions...",
            noTransactions: "No transactions yet",
            cancel: "Cancel",
            noDate: "No Date"
          },
          statusLabels: {
            overspent: "Overspent",
            limitReached: "Limit Reached",
            completed: "Completed",
            expired: "Expired",
            nearLimit: "Near Limit",
            active: "Active"
          },
          charts: {
            budgetVsSpent: "Budget vs. Spent",
            allocated: "Allocated",
            spent: "Spent",
            spendingOverview: "Spending Overview",
            spendingOverviewDesc: "Visualize your budget allocation and spending habits to stay on track.",
            successRate: "Success Rate",
            successRateDesc: "Budgets kept within limit",
            underBudget: "Under Budget",
            overBudget: "Over Budget",
            spendingTrend: "Spending Trend",
            spendingTrendDesc: "Last 10 budgets: Planned vs. Actual",
            limit: "Limit",
            totalActiveBudgets: "Total Active Budgets",
            budgetsCount: "{{count}} Budgets"
          },
          alerts: {
            deleteBudgetTitle: "Delete Budget?",
            deleteBudgetMsg: "This action cannot be undone.",
            deletePreserveTitle: "Delete & Preserve History?",
            deletePreserveMsg: "This budget has {{count}} transaction(s). They will be unlinked but kept in your history.",
            confirmDeleteBtn: "Yes, delete it",
            cancelBtn: "Cancel",
            deleteSuccessTitle: "Deleted!",
            deleteSuccessMsg: "Budget deleted successfully.",
            deleteErrorTitle: "Error",
            deleteErrorMsg: "Failed to delete budget.",
            deleteTxSuccessTitle: "Deleted!",
            deleteTxSuccessMsg: "Transaction deleted successfully.",
            deleteTxErrorTitle: "Error",
            deleteTxErrorMsg: "Failed to delete transaction"
          }
        },
        settings: {
          header: {
            title: "Settings",
            subtitle: "Manage your account preferences and security"
          },
          sidebar: {
            profile: "Profile",
            security: "Security",
            notifications: "Notifications",
            app: "App Settings"
          },
          profile: {
            title: "Your Profile",
            subtitle: "Update your photo and personal details here.",
            fullName: "Full Name",
            email: "Email Address",
            language: "Language",
            currency: "Currency",
            namePlaceholder: "Enter your full name",
            emailImmutable: "Email address cannot be changed.",
            saveBtn: "Save Changes",
            savingBtn: "Saving..."
          },
          security: {
            setPw: {
              title: "Set a Password",
              desc: "You are currently logged in via Google. You don't need a password, but you can set one if you'd like to log in with email/password as well.",
              submit: "Set Password"
            },
            changePw: {
              title: "Change Password",
              desc: "Update your password to keep your account secure.",
              current: "Current Password",
              forgot: "Forgot Password?",
              new: "New Password",
              confirm: "Confirm New Password",
              submit: "Change Password"
            },
            validation: {
              required: "Password is required",
              min: "Password must be at least 8 characters",
              confirmReq: "Please confirm your password",
              match: "Passwords do not match",
              currentReq: "Current password is required"
            },
            danger: {
              title: "Danger Zone",
              deleteTitle: "Delete Account",
              deleteDesc: "Permanently delete your account and all associated data. This action cannot be undone.",
              deleteBtn: "Delete Account"
            },
            alerts: {
              pwSetTitle: "Password Set!",
              pwSetMsg: "You can now log in with your email and password.",
              pwChangeTitle: "Password Changed!",
              pwChangeMsg: "Your password has been updated successfully.",
              error: "Error"
            }
          },
          notifications: {
            title: "Notification Preferences",
            subtitle: "Manage how you receive notifications.",
            emailTitle: "Email Notifications",
            emailDesc: "Receive emails about account activity and updates."
          },
          app: {
            title: "Appearance",
            subtitle: "Customize how the application looks on your device.",
            light: "Light",
            lightDesc: "Clean and bright interface",
            dark: "Dark",
            darkDesc: "Easy on the eyes in low light",
            system: "System",
            systemDesc: "Matches your device settings"
          }
        },
        swal: {
          confirmTitle: "Are you sure?",
          confirmText: "This action cannot be undone.",
          confirmBtn: "Yes, delete it",
          cancelBtn: "Cancel",
          yesBtn: "Yes",
          successTitle: "Success",
          errorTitle: "Error",
          errorText: "Something went wrong",
          infoTitle: "Info",
          warningTitle: "Warning",
          okBtn: "OK",
          // New keys
          importSuccess: "Successfully imported {{count}} transactions.",
          loginSuccess: "Login Successful! Welcome back!",
          settingsSaved: "Settings Saved!",
          settingsSavedMsg: "Your preferences have been updated successfully.",
          accountDeleted: "Deleted!",
          accountDeletedMsg: "Your account has been deleted.",
          preferencesUpdated: "Preferences Updated",
          emailEnabled: "Email notices enabled",
          emailDisabled: "Email notices disabled",
          verificationSent: "Verification email sent. Please check your inbox.",
          transactionAdded: "Added!",
          transactionUpdated: "Updated!",
          transactionSavedMsg: "Transaction saved successfully.",
          transactionDeleted: "Deleted!",
          transactionDeletedMsg: "Transaction has been removed.",
          savingsAllocated: "Transaction saved & {{amount}} allocated to \"{{goal}}\".",
          savingsUpdated: "Updated!",
          savingsUpdatedMsg: "Savings goal updated successfully.",
          savingsCreated: "Created!",
          savingsCreatedMsg: "Savings goal created successfully.",
          limitReached: "Limit Reached",
          limitReachedMsg: "You can only have 6 active savings goals at a time.",
          exportSuccess: "Exported!",
          exportSuccessMsg: "Financial report downloaded successfully.",
          exportFailed: "Export Failed",
          exportFailedMsg: "Could not generate the Excel report.",
          passwordReset: "Password Reset!",
          passwordResetMsg: "Your password has been successfully reset. You can now log in with your new password.",
          budgetSaveError: "Failed to save budget",
          deleteTxTitle: "Delete Transaction?",
          deleteTxHistoryMsg: "This will remove it from your budget history.",
          googleSignupError: "Something went wrong with Google signup. Try again later.",
          googleSignupInitError: "Failed to initiate Google signup",
          googleLoginError: "Something went wrong with Google login. Try again later."
        },
        import: {
          title: "Import Transactions",
          uploadTitle: "Click to upload CSV",
          uploadDesc: "Required columns: Date, Name, Amount, Type",
          removeBtn: "Remove",
          showingPreview: "Showing first 5 rows",
          cancelBtn: "Cancel",
          importBtn: "Import Transactions",
          processingBtn: "Processing...",
          defaultDescription: "Imported via CSV",
          errors: {
            invalidType: "Please upload a valid CSV file.",
            invalidFormat: "Invalid CSV format. Required columns: Date, Amount, Type, Name/Description",
            emptyFile: "File is empty.",
            parseError: "Error parsing file: {{error}}",
            rowError: "Row {{row}} has an invalid amount: \"{{amount}}\". Please only use numbers.",
            generic: "Import failed"
          }
        },
        notifications: {
          budgetReached: "You have reached 100% of your allocated amount for **{{name}}**",
          budgetWarning: "You have used over 85% of your **{{name}}** budget.",
          savingCompleted: "Congratulations! You have reached your savings goal for **{{name}}**",
          savingWarning: "You are 85% of the way to your **{{name}}** goal!",
          default: "New notification"
        },
        reports: {
          header: {
            title: "Financial Reports",
            subtitle: "Deep dive into your financial health",
            exportBtn: "Export Report"
          },
          stats: {
            income: "Total Income",
            expenses: "Total Expenses",
            net: "Net Balance"
          },
          filters: {
            thisMonth: "This Month",
            lastMonth: "Last Month",
            allTime: "All Time",
            custom: "Custom",
            startDate: "Start Date",
            endDate: "End Date"
          },
          charts: {
            expenseBreakdown: "Expense Breakdown",
            noExpenseData: "No expense data available",
            incomeVsExpense: "Income vs Expenses",
            savingsPerformance: "Savings Performance",
            totalSaved: "Total Saved",
            inPeriod: "in this period",
            savingsRate: "Savings Rate",
            ofIncome: "of total income",
            topGoal: "Top Goal",
            noSavings: "No savings activity in this period",
            contributionsHint: "Contributions will appear here"
          },
          budgetCompliance: {
            title: "Budget Compliance",
            headers: {
              name: "Budget Name",
              category: "Category",
              allocated: "Allocated",
              spent: "Spent",
              remaining: "Remaining",
              status: "Status"
            },
            empty: "No budget data found for this period.",
            spent: "Spent",
            allocated: "Allocated"
          }
        },
      savings: {
          header: {
              title: "Savings Goals",
              subtitle: "Visualize your dreams and track your progress",
              createBtn: "New Goal"
          },
          stats: {
              totalSaved: "Total Saved",
              topGoal: "Top Goal",
              startGoal: "Start a Goal",
              remaining: "Remaining"
          },
          filters: {
              searchPlaceholder: "Search savings goals...",
              activeTab: "Active",
              historyTab: "History",
              sortBy: {
                  newest: "Newest First",
                  targetAmount: "Target Amount",
                  currentAmount: "Current Amount",
                  name: "Name"
              },
              ascending: "Ascending",
              descending: "Descending"
          },
          activeList: {
              emptyTitle: "No active savings goals",
              emptyDesc: "Start saving for your dreams by creating a new goal.",
              target: "Target",
              saved: "Saved",
              created: "Created",
              viewDetails: "View Details"
          },
          historyTable: {
              title: "Savings History",
              subtitle: "Completed Goals",
              headers: {
                  name: "Name",
                  target: "Target",
                  finalAmount: "Final Amount",
                  date: "Date",
                  status: "Status",
                  actions: "Actions"
              },
              loading: "Loading history...",
              empty: "No savings history found.",
              status: {
                  completed: "Completed"
              },
              previous: "Previous",
              next: "Next",
              page: "Page",
              of: "of"
          },
          charts: {
              radial: {
                  title: "Goal Progress",
                  empty: "No active goals to display"
              },
              surplus: {
                  title: "Savings Surplus",
                  subtitle: "Base Goals vs. Bonus Savings",
                  targetMet: "Target Met",
                  surplus: "Surplus (Bonus)",
                  totalSaved: "Total Saved",
                  noData: "No Data"
              },
              trend: {
                  title: "Savings Performance",
                  subtitle: "Last 10 goals: Target vs. Actual Saved",
                  target: "Target",
                  saved: "Saved"
              },
              growthTracker: {
                  title: "Growth Tracker",
                  desc: "Watch your savings grow and track your progress towards your financial goals."
              },
              tooltip: {
                  saved: "Saved",
                  target: "Target",
                  completed: "Completed"
              }
          },
          modal: {
              titleNew: "New Savings Goal",
              titleEdit: "Edit Goal",
              targetLabel: "Target Goal Amount",
              targetPlaceholder: "0.00",
              targetRequired: "Target amount is required",
              targetMin: "Target must be > 0",
              nameLabel: "Goal Name",
              namePlaceholder: "e.g. New MacBook, Vacation",
              nameRequired: "Goal name is required",
              alreadySavedLabel: "Already Saved?",
              alreadySavedOptional: "(optional)",
              currentMin: "Cannot be negative",
              descriptionLabel: "Description",
              descriptionPlaceholder: "What is this for?",
              preview: "Preview",
              complete: "Complete",
              saveBtn: {
                  loading: "Saving...",
                  update: "Update Goal",
                  create: "Set Goal"
              },
              currentSaved: "Current Saved",
              saveChanges: "Save Changes"
          },
          card: {
              completed: "Completed",
              goalCompleted: "Goal Completed",
              totalSaved: "Total Saved",
              target: "Target",
              reached: "reached",
              toGo: "To Go",
              note: "Note",
              historyTitle: "Contributions and Withdrawal History",
              loadingHistory: "Loading history...",
              noHistory: "No contribution history",
              addBtn: "Add",
              withdrawBtn: "Withdraw",
              cancelBtn: "Cancel",
              saved: "Saved",
              withdrawn: "Withdrawn",
              contribution: "Contribution",
              withdrawal: "Withdrawal",
              overview: "Overview",
              history: "History",
              deleteTx: "Delete Transaction",
              syncing: "Syncing..."
          },
          alerts: {
              addContributionTitle: "Add Contribution",
              addContributionPlaceholder: "Amount to add (e.g., 50.00)",
              availableBalance: "Available Net Balance",
              recordedAsExpense: "(Recorded as Expense)",
              contributeBtn: "Contribute",
              validAmount: "Please enter a valid amount.",
              insufficientFunds: "Insufficient funds. Available: ",
              contributionAddedTitle: "Contribution Added!",
              contributionAddedMsg: "{{amount}} added to {{name}}.",
              withdrawTitle: "Withdraw Funds",
              withdrawPlaceholder: "Amount to withdraw",
              availableToWithdraw: "Available to Withdraw",
              recordedAsIncome: "(Recorded as Income)",
              withdrawBtn: "Withdraw",
              cannotWithdrawMore: "Cannot withdraw more than saved.",
              withdrawnDeletedTitle: "Withdrawn & Deleted",
              withdrawnDeletedMsg: "{{amount}} withdrawn. Goal deleted as it is empty.",
              withdrawnTitle: "Withdrawn!",
              withdrawnMsg: "{{amount}} withdrawn from {{name}}.",
              errorTitle: "Error",
              addFailed: "Failed to add contribution.",
              withdrawFailed: "Failed to withdraw funds.",
              saveSuccessTitle: "Saved!",
              saveSuccessMsg: "Goal updated successfully.",
              saveErrorTitle: "Error",
              saveErrorMsg: "Failed to update goal.",
              deleteTxTitle: "Delete Transaction?",
              deleteTxMsg: "This will revert the balance impact on this goal.",
              deleteTxErrorTitle: "Error",
              deleteTxErrorMsg: "Failed to delete transaction.",
              deleteTxBtn: "Yes, delete it",
              cancelBtn: "Cancel",
              deleteGoalTitle: "Delete Goal?",
              deleteGoalMsg: "This action cannot be undone.",
              returnFundsTitle: "Return Funds to Balance?",
              returnFundsMsg: "This goal has {{count}} transaction(s) totaling {{amount}}. Deleting this will remove these transactions and return the money to your Available Balance.",
              deleteSuccessTitle: "Deleted",
              deleteSuccessMsg: "Goal deleted successfully.",
              returnSuccessMsg: "Goal deleted and funds returned to balance.",
              deleteGoalErrorTitle: "Error",
              deleteGoalErrorMsg: "Failed to delete goal or refund transactions."
          }
      },
      },
      about: {
        title: "About Us",
        intro: "We're on a mission to simplify personal finance for everyone. MoneyTracker was built to help you take control of your financial future.",
        values: [
          { title: "Community First", desc: "Built for real people with real financial goals." },
          { title: "Excellence", desc: "Award-winning design and security standards." },
          { title: "Global Vision", desc: "Helping users worldwide achieve financial freedom." }
        ],
        history: {
          p1: "Founded in 2025, MoneyTracker started with a simple idea: budgeting shouldn't be boring. We believe that when you can see your money clearly, you can make better decisions.",
          p2: "Our team consists of finance experts, designers, and engineers who are passionate about creating tools that are not only powerful but also a joy to use."
        }
      },
      careers: {
        title: "Join Our Team",
        intro: "Help us build the future of personal finance. We're looking for passionate individuals to join our remote-first team.",
        jobs: [
            { role: "Senior Frontend Engineer", dept: "Engineering", type: "Full-time", loc: "Remote" },
            { role: "Product Designer", dept: "Design", type: "Full-time", loc: "Remote" },
            { role: "Customer Success Manager", dept: "Operations", type: "Full-time", loc: "New York, NY" },
            { role: "Backend Developer (Laravel)", dept: "Engineering", type: "Contract", loc: "Remote" }
        ],
        cta: {
            title: "Don't see the right role?",
            text: "We're always looking for talent. Send your resume to careers@moneytracker.com",
            button: "Email Us"
        }
      },
      blog: {
        title: "Blog",
        subtitle: "Tips, tricks, and insights on mastering your money.",
        posts: [
            { title: "5 Ways to Save for a House in 2025", excerpt: "Strategies to boost your savings rate without sacrificing your lifestyle.", date: "Dec 01, 2025", author: "Sarah J." },
            { title: "Understanding the 50/30/20 Rule", excerpt: "The classic budgeting rule explained for modern finances.", date: "Nov 28, 2025", author: "Mike T." },
            { title: "Why We Switched to Serverless", excerpt: "A technical deep dive into how MoneyTracker scales.", date: "Nov 15, 2025", author: "Dev Team" }
        ]
      },
      contact: {
        title: "Get in Touch",
        intro: "We'd love to hear from you. Our team is here to help.",
        methods: [
            { title: "Chat Support", desc: "Our fastest way to get help.", action: "Start Chat" },
            { title: "Email Us", desc: "Send us a detailed message.", action: "support@moneytracker.com" },
            { title: "Phone", desc: "Mon-Fri from 8am to 5pm.", action: "+1 (555) 000-0000" }
        ],
        form: {
            title: "Send us a message",
            firstName: "First Name",
            lastName: "Last Name",
            email: "Email",
            message: "Message",
            button: "Send Message"
        }
      },
      privacy: {
        title: "Privacy Policy",
        lastUpdated: "Last updated: December 05, 2025",
        intro: "At MoneyTracker, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.",
        sections: [
            { title: "Information We Collect", content: "We collect information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services." },
            { title: "How We Use Your Information", content: "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience." },
            { title: "Disclosure of Your Information", content: "We may share information we have collected about you in certain situations. Your information may be disclosed as follows: By Law or to Protect Rights, Third-Party Service Providers." }
        ],
        contact: {
            title: "Contact Us",
            text: "If you have questions or comments about this Privacy Policy, please contact us at:"
        }
      },
      terms: {
        title: "Terms of Service",
        lastUpdated: "Last updated: December 05, 2025",
        intro: "Please read these Terms of Service carefully before using the MoneyTracker website and mobile application.",
        sections: [
            { title: "Accounts", content: "When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms." },
            { title: "Intellectual Property", content: "The Service and its original content, features, and functionality are and will remain the exclusive property of MoneyTracker and its licensors." },
            { title: "Termination", content: "We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms." }
        ],
        contact: {
            title: "Questions?",
            text: "If you have any questions about these Terms, please contact us at:"
        }
      }
    }
  },
  fil: {
    translation: {
      landing: {
        hero: {
          version: "Live na ang v2.0",
          title: "Hawakan ang Pera,",
          highlight: "Nang Walang Hirap.",
          subtitle: "Subaybayan, Mag-ipon, at Palaguin ang iyong yaman gamit ang aming mga simpleng tool.",
          cta: "Magsimula nang Libre",
          secondaryCta: "Paano ito gumagana",
          lovedBy: "Mahal ng 10,000+ users",
          card: {
              totalBalance: "Kabuuang Balanse",
              savingsGoal: "Layunin sa Ipon",
              budgetStatus: "Katayuan ng Budget",
              onTrack: "Nasa Ayos"
          }
        },
        features: {
          title: "Lahat ng kailangan para",
          highlight: "yumaman.",
          subtitle: "Malalakas na tool para kontrolin ang iyong hinaharap sa pananalapi, sa isang simple at madaling gamitin na interface.",
          items: {
            dashboard: { title: "Interactive Dashboard", desc: "Makita ang kabuuan ng iyong pananalapi. Subaybayan ang kita, gastos, at ipon sa real-time." },
            budgeting: { title: "Matalinong Pag-budget", desc: "Magtakda ng limitasyon kada buwan. Susubaybayan namin ang gastos mo at aalertuhan ka." },
            goals: { title: "Pagsubaybay sa Layunin", desc: "Gumawa ng layunin para sa iyong mga pangarap. Subaybayan ang pag-usad at abutin ito nang mas mabilis." },
            reports: { title: "Detalyadong Ulat", desc: "Suriin ang iyong gawi sa paggastos gamit ang komprehensibong ulat." }
          }
        },
        testimonials: {
            title: "Mahal ng",
            highlight: "libo-libong tao",
            subtitle: "Huwag lang maniwala sa amin. Ito ang sabi ng aming komunidad.",
            items: [
                {name: "Sarah Johnson", role: "Freelance Designer", quote: "Binago ng MoneyTracker kung paano ko pamahalaan ang kita ko. Napakalaking tulong!"},
                {name: "Michael Chen", role: "Software Engineer", quote: "Ang pinakamalinis na app na nagamit ko. Walang kalat, puro insights lang para sa ipon ko."},
                {name: "Emily Davis", role: "Small Business Owner", quote: "Naiintindihan ko na kung saan napupunta ang pera ko. Ang ganda ng mga reports!"}
            ]
        },
        currencySymbol: "₱",
        nav: {
          login: "Mag-login",
          signup: "Mag-rehistro",
          menu: {
            features: "Mga Tampok",
            testimonials: "Mga Patotoo",
            faq: "FAQ"
          }
        },
        security: {
          badge: "Seguridad na Pang-bangko",
          title: "Ang iyong data ay ligtas",
          highlight: "at panatag.",
          subtitle: "Sineseryoso namin ang seguridad. Mula sa pag-sign up, protektado na ang iyong financial data.",
          items: [
            { title: "Ligtas na Pagpapatunay", desc: "Pinapagana ng Laravel Sanctum para sa matibay na proteksyon." },
            { title: "Password Hashing", desc: "Naka-hash ang mga password gamit ang Bcrypt/Argon2. Hindi namin nakikita ang password mo." },
            { title: "Privacy ng Data", desc: "Sa iyo ang data mo. Hindi namin ibinebenta o ipinapamahagi ang iyong impormasyon." }
          ],
          card: {
            statusTitle: "Katayuan ng Seguridad",
            status: "Aktibo at Namomonitor",
            encryption: "Encryption",
            database: "Database",
            isolated: "Nakahiwalay at Protektado",
            backups: "Backups",
            daily: "Araw-araw na Naka-encrypt"
          }
        },
        roadmap: {
          title: "Bumubuo para sa",
          highlight: "kinabukasan",
          subtitle: "Patuloy kaming nagpapabuti. Narito ang mga susunod sa MoneyTracker.",
          items: [
            { quarter: "Q1 2026", title: "Data Export", desc: "I-download ang iyong kasaysayan sa CSV at PDF para sa buwis.", status: "Ginagawa Na" },
            { quarter: "Q2 2026", title: "Recurring Transactions", desc: "I-automate ang kita at gastos para hindi na mag-type nang manu-mano.", status: "Plano" },
            { quarter: "Q3 2026", title: "Multi-Currency", desc: "Subaybayan ang yaman sa USD, PHP, at CNY na may real-time conversion.", status: "Plano" }
          ]
        },
        faq: {
            title: "Mga Madalas Itanong",
            subtitle: "May mga katanungan? May mga sagot kami.",
            items: [
              { question: "Libre ba talaga ang MoneyTracker?", answer: "Oo! Ang aming mga pangunahing tampok ay libre magpakailanman. Mayroon din kaming Premium plan para sa mas advanced na features." },
              { question: "Ligtas ba ang aking data?", answer: "Priority namin ang seguridad mo. Naka-encrypt ang iyong password at hindi namin ibinebenta ang iyong impormasyon." },
              { question: "Pwede ko bang i-export ang data ko?", answer: "Oo, maaari mong i-download ang iyong transaction history at reports sa CSV or PDF anumang oras." },
              { question: "Konektado ba ito sa bangko?", answer: "Sa ngayon, manual entry muna para sa maximum privacy. Pero ginagawa na namin ang bank syncing." }
            ]
        },
        cta_section: {
          title: "Handa nang humawak sa kontrol?",
          subtitle: "Sumali sa libu-libong users na bumubuo ng mas magandang kinabukasan gamit ang MoneyTracker.",
          button: "Gumawa ng Libreng Account",
          disclaimer: "Walang credit card na kailangan • May libreng plano magpakailanman"
        },
        footer: {
          description: "Ang pinakamatalinong paraan upang pamahalaan ang iyong pananalapi. Ginawa nang may seguridad at simple.",
          headers: {
            product: "Produkto",
            company: "Kumpanya"
          },
          links: {
            features: "Mga Tampok",
            security: "Seguridad",
            roadmap: "Roadmap",
            about: "Tungkol",
            careers: "Karera",
            blog: "Blog",
            contact: "Makipag-ugnayan",
            privacy: "Patakaran sa Privacy",
            terms: "Mga Tuntunin ng Serbisyo"
          },
          copyright: "© 2025 MoneyTracker. Nakareserba ang lahat ng karapatan."
        }
      },
      common: {
        backToHome: "Bumalik sa Home"
      },
      app: {
        sidebar: {
          overview: "Pangkalahatan",
          tracking: "Pagsubaybay",
          management: "Pamamahala",
          insights: "Mga Pananaw",
          system: "Sistema",
          items: {
            dashboard: "Dashboard",
            transactions: "Mga Transaksyon",
            budgets: "Mga Budget",
            savings: "Ipon",
            reports: "Mga Ulat",
            settings: "Mga Setting"
          }
        },
        topbar: {
          notifications: "Mga Abiso",
          noNotifications: "Walang bagong abiso",
          justNow: "Kani-kanina lang",
          accountSettings: "Mga Setting ng Account",
          signOut: "Mag-sign out",
          logoutModal: {
            title: "Mag-sign out?",
            text: "Sigurado ka bang gusto mong tapusin ang iyong session?",
            confirm: "Mag-sign out"
          }
        },
        footer: {
          rights: "Nakareserba ang lahat ng karapatan",
          followUs: "Sundan kami:"
        },
        dashboard: {
          welcome: "Maligayang pagbabalik, {{name}}",
          stats: {
            income: "Kabuuang Kita",
            expenses: "Kabuuang Gastos",
            netBalance: "Netong Balanse",
            totalSavings: "Kabuuang Ipon"
          },
          charts: {
            title: "Pangkalahatang Pananalapi",
            subtitle: "Kita, Gastos at Ipon (Huling 7 Araw)",
            income: "Kita",
            expense: "Gastos",
            savings: "Ipon"
          },
          recentActivity: {
            title: "Kamakailang Aktibidad",
            subtitle: "Pinakabagong mga transaksyon",
            noTransactions: "Walang kamakailang transaksyon",
            syncing: "Nagsi-sync..."
          },
          budgets: {
            title: "Mga Aktibong Budget",
            subtitle: "Mga limitasyon sa paggastos",
            noBudgets: "Walang aktibong budget. Magtakda ng limitasyon.",
            limit: "Limitasyon",
            overBy: "Sobra ng",
            left: "ang natitira"
          },
          savings: {
            title: "Mga Layunin sa Ipon",
            subtitle: "Subaybayan ang iyong mga pangarap",
            noGoals: "Walang layunin sa ipon. Magsimulang mag-ipon.",
            target: "Target"
          }
        },
        transactions: {
            header: {
              title: "Mga Transaksyon",
              subtitle: "Pamahalaan ang iyong mga rekord",
              addBtn: "Magdagdag",
              importBtn: "Mag-import",
              exportBtn: "Mag-export"
            },
            stats: {
              totalIncome: "Kabuuang Kita",
              totalExpenses: "Kabuuang Gastos",
              netBalance: "Netong Balanse"
            },
            filters: {
              searchPlaceholder: "Maghanap ng transaksyon...",
              filterBtn: "Mga Filter",
              clearBtn: "I-clear",
              categoryPlaceholder: "Lahat ng Kategorya",
              type: {
                all: "Lahat ng Uri",
                income: "Kita",
                expense: "Gastos"
              },
              date: {
                all: "Lahat ng Oras",
                today: "Ngayon",
                yesterday: "Kahapon",
                last7: "Huling 7 Araw",
                last30: "Huling 30 Araw",
                thisMonth: "Ngayong Buwan",
                lastMonth: "Nakaraang Buwan",
                custom: "Pasadyang Saklaw",
                sortByDate: "Ayusin ayon sa Petsa",
                sortByAmount: "Ayusin ayon sa Halaga",
                sortByCreated: "Ayusin ayon sa Pagkakalikha"
              }
            },
            table: {
              title: "Kasaysayan ng Transaksyon",
              subtitle: "Lahat ng Transaksyon",
              headers: {
                date: "Petsa",
                category: "Kategorya",
                description: "Pangalan at Paglalarawan",
                amount: "Halaga",
                type: "Uri",
                actions: "Aksyon"
              },
              empty: "Walang transaksyong natagpuan",
              syncing: "Nagsi-sync...",
              editingDisabled: "Bawal na i-edit pagkalipas ng 1 oras",
              editTooltip: "I-edit ang Transaksyon",
              prev: "Nakaraan",
              next: "Susunod",
              page: "Pahina",
              of: "ng",
              actions: {
                edit: "I-edit",
                delete: "Burahin"
              }
            },
            modal: {
              titleNew: "Bagong Transaksyon",
              titleEdit: "I-edit ang Transaksyon",
              income: "Kita",
              expense: "Gastos",
              date: "Petsa",
              category: "Kategorya",
              description: "Paglalarawan",
              namePlaceholder: "Para saan ito?",
              notePlaceholder: "Magdagdag ng tala (opsyonal)",
              save: "I-save ang Pagbabago",
              add: "Magdagdag",
              required: "Kinakailangan",
              noteTime: "Tandaan: Ang transaksyon ay maaring i-edit lamang sa loob ng 1 oras.",
              selectCategory: "Pumili",
              allocateSavings: "Ilagay sa Ipon",
              selectGoal: "Pumili ng Layunin",
              chooseGoal: "Pumili...",
              progress: "Progreso:",
              amount: "Halaga",
              percent: "Porsyento (%)",
              budgetStatus: {
                over: "Sobra",
                onTrack: "Ayos",
                spent: "nagastos",
                left: "natitira"
              }
            }
            },
        budgets: {
          header: {
            title: "Mga Budget",
            subtitle: "Magplano, subaybayan, at mag-ipon para sa hinaharap",
            createBtn: "Gumawa ng Budget"
          },
          stats: {
            activeAllocated: "Naka-allocate (Aktibo)",
            historyAllocated: "Naka-allocate (Nakaraan)",
            activeSpent: "Nagastos (Aktibo)",
            historySpent: "Nagastos (Nakaraan)",
            activeCount: "Bilang (Aktibo)",
            historyCount: "Bilang (Nakaraan)"
          },
          filters: {
            searchPlaceholder: "Maghanap ng budget...",
            activeTab: "Aktibo",
            historyTab: "Kasaysayan",
            allCategories: "Lahat ng Kategorya",
            sortBy: {
              newest: "Pinakabago",
              endDate: "Petsa ng Pagtatapos",
              amount: "Halaga",
              name: "Pangalan"
            },
            ascending: "Paakyat",
            descending: "Pababa"
          },
          list: {
            emptyTitle: "Walang aktibong budget",
            emptyDesc: "subukang baguhin ang filters o gumawa ng bago.",
            allocated: "Naka-allocate",
            spent: "Nagastos",
            viewDetails: "Tingnan ang detalye",
            noActive: "Walang aktibong budget"
          },
          history: {
            title: "Kasaysayan ng Budget",
            subtitle: "Tapos at Expired",
            headers: {
              name: "Pangalan",
              category: "Kategorya",
              allocated: "Naka-allocate",
              spent: "Nagastos",
              status: "Katayuan",
              actions: "Aksyon"
            },
            loading: "Naglo-load ng kasaysayan...",
            empty: "Walang kasaysayan ng budget na tugma sa filters.",
            previous: "Nakaraan",
            next: "Susunod",
            page: "Pahina",
            of: "ng"
          },
          modal: {
            titleNew: "Bagong Budget",
            titleEdit: "I-edit ang Budget",
            limitLabel: "Limitasyon ng Budget",
            nameLabel: "Pangalan ng Budget",
            namePlaceholder: "hal., Monthly Groceries",
            descriptionPlaceholder: "Magdagdag ng tala (opsyonal)",
            categoryLabel: "Kategorya",
            selectCategory: "Pumili ng kategorya",
            startDateLabel: "Petsa ng Simula",
            endDateLabel: "Petsa ng Pagtatapos",
            duration: "Tagal:",
            createBtn: "Gumawa ng Budget",
            updateBtn: "I-update ang Budget",
            activeCategory: "(Aktibo)",
            validation: {
              amountRequired: "Kinakailangan ang halaga",
              amountMin: "Dapat higit sa 0",
              nameRequired: "Kinakailangan ang pangalan",
              nameMax: "Max 100 characters",
              categoryRequired: "Kinakailangan ang kategorya",
              endDateRequired: "Kinakailangan ang petsa ng pagtatapos",
              endDatePast: "Hindi maaaring nasa nakaraan",
              endDateBeforeStart: "Dapat pagkatapos ng petsa ng simula"
            },
            saving: "Nagse-save...",
            durationValues: {
              invalid: "Hinda wastong tagal",
              day: "Araw",
              days: "Araw"
            }
          },
          card: {
            expired: "Expired",
            overview: "Pangkalahatan",
            history: "Kasaysayan",
            overBudgetBy: "Sobra sa Budget ng",
            remainingBudget: "Natitirang Budget",
            criticalOverspend: "Kritikal na Sobra",
            used: "nagamit",
            allocated: "Naka-allocate",
            spent: "Nagastos",
            note: "Tala",
            historyTitle: "Kasaysayan ng Transaksyon",
            loadingHistory: "Naglo-load ng mga transaksyon...",
            noTransactions: "Wala pang transaksyon",
            cancel: "Kanselahin",
            noDate: "Walang Petsa"
          },
          statusLabels: {
            overspent: "Sobra sa gastos",
            limitReached: "Limitasyon Naabot",
            completed: "Tapos na",
            expired: "Expired",
            nearLimit: "Malapit sa Limit",
            active: "Aktibo"
          },
          charts: {
            budgetVsSpent: "Budget kumpara sa Gastos",
            allocated: "Nakalaan",
            spent: "Nagatos",
            spendingOverview: "Pangkalahatang-ideya ng Paggastos",
            spendingOverviewDesc: "I-visualize ang iyong alokasyon ng badyet at mga gawi sa paggastos.",
            successRate: "Rate ng Tagumpay",
            successRateDesc: "Mga badyet na nasa loob ng limitasyon",
            underBudget: "Pasok sa Badyet",
            overBudget: "Sobra sa Badyet",
            spendingTrend: "Trend ng Paggastos",
            spendingTrendDesc: "Huling 10 badyet: Plano vs. Aktwal",
            limit: "Hangganan",
            totalActiveBudgets: "Kabuuang Aktibong Badyet",
            budgetsCount: "{{count}} na Badyet"
          },
          alerts: {
            deleteBudgetTitle: "Burahin ang Budget?",
            deleteBudgetMsg: "Hindi na ito maibabalik.",
            deletePreserveTitle: "Burahin at Itago ang History?",
            deletePreserveMsg: "Ang budget na ito ay may {{count}} na transaksyon. Maaalis ang link ng mga ito ngunit mananatili sa iyong history.",
            confirmDeleteBtn: "Oo, burahin ito",
            cancelBtn: "Kanselahin",
            deleteSuccessTitle: "Nabura na!",
            deleteSuccessMsg: "Tagumpay na nabura ang budget.",
            deleteErrorTitle: "Error",
            deleteErrorMsg: "Nabigo sa pagbura ng budget.",
            deleteTxSuccessTitle: "Nabura na!",
            deleteTxSuccessMsg: "Tagumpay na nabura ang transaksyon.",
            deleteTxErrorTitle: "Error",
            deleteTxErrorMsg: "Nabigo sa pagbura ng transaksyon."
          }
        },
        settings: {
          header: {
            title: "Mga Setting",
            subtitle: "Pamahalaan ang mga kagustuhan ng iyong account at seguridad"
          },
          sidebar: {
            profile: "Profile",
            security: "Seguridad",
            notifications: "Mga Abiso",
            app: "Mga Setting ng App"
          },
          profile: {
            title: "Ang Iyong Profile",
            subtitle: "I-update ang iyong larawan at mga detalye dito.",
            fullName: "Buong Pangalan",
            email: "Email Address",
            language: "Wika",
            currency: "Pananalapi",
            namePlaceholder: "Ilagay ang iyong buong pangalan",
            emailImmutable: "Hindi maaaring baguhin ang email address.",
            saveBtn: "I-save",
            savingBtn: "Nagse-save..."
          },
          security: {
            setPw: {
              title: "Magtakda ng Password",
              desc: "Naka-login ka gamit ang Google. Hindi mo kailangan ng password, ngunit maaari kang magtakda kung nais mong mag-login gamit ang email/password.",
              submit: "Itakda ang Password"
            },
            changePw: {
              title: "Palitan ang Password",
              desc: "I-update ang iyong password upang mapanatiling ligtas ang iyong account.",
              current: "Kasalukuyang Password",
              forgot: "Nakalimutan ang Password?",
              new: "Bagong Password",
              confirm: "Kumpirmahin ang Bagong Password",
              submit: "Palitan ang Password"
            },
            validation: {
              required: "Kinakailangan ang password",
              min: "Ang password ay dapat na hindi bababa sa 8 letra",
              confirmReq: "Pakikumpirma ang iyong password",
              match: "Hindi magkatugma ang mga password",
              currentReq: "Kinakailangan ang kasalukuyang password"
            },
            danger: {
              title: "Danger Zone",
              deleteTitle: "Burahin ang Account",
              deleteDesc: "Permanenteng burahin ang iyong account at lahat ng data. Hindi na ito maibabalik pa.",
              deleteBtn: "Burahin ang Account"
            },
            alerts: {
              pwSetTitle: "Naitakda na ang Password!",
              pwSetMsg: "Maaari ka nang mag-login gamit ang iyong email at password.",
              pwChangeTitle: "Napalitan na ang Password!",
              pwChangeMsg: "Matagumpay na na-update ang iyong password.",
              error: "Error"
            }
          },
          notifications: {
            title: "Mga Kagustuhan sa Abiso",
            subtitle: "Pamahalaan kung paano mo natatanggap ang mga abiso.",
            emailTitle: "Mga Abiso sa Email",
            emailDesc: "Makatanggap ng mga email tungkol sa aktibidad ng account at mga update."
          },
          app: {
            title: "Itsura",
            subtitle: "I-customize kung paano tingnan ang aplikasyon sa iyong device.",
            light: "Maliwanag",
            lightDesc: "Malinis at maliwanag na interface",
            dark: "Madilim",
            darkDesc: "Madali sa mata sa madilim na ilaw",
            system: "System",
            systemDesc: "Tumutugma sa mga setting ng iyong device"
          }
        },
        swal: {
          confirmTitle: "Sigurado ka ba?",
          confirmText: "Hindi na ito maibabalik pa.",
          confirmBtn: "Oo, burahin ito",
          cancelBtn: "Kanselahin",
          yesBtn: "Oo",
          successTitle: "Tagumpay",
          errorTitle: "Error",
          errorText: "May maling nangyari",
          infoTitle: "Impormasyon",
          warningTitle: "Babala",
          okBtn: "OK",
          // New keys
          importSuccess: "Matagumpay na na-import ang {{count}} na transaksyon.",
          loginSuccess: "Matagumpay na Login! Maligayang pagbabalik!",
          settingsSaved: "Nai-save na ang Settings!",
          settingsSavedMsg: "Matagumpay na na-update ang iyong mga kagustuhan.",
          accountDeleted: "Nabura na!",
          accountDeletedMsg: "Nabura na ang iyong account.",
          preferencesUpdated: "Na-update na ang Kagustuhan",
          emailEnabled: "Naka-enable na ang abiso sa email",
          emailDisabled: "Naka-disable na ang abiso sa email",
          verificationSent: "Naipadala na ang verification email. Pakisuri ang iyong inbox.",
          transactionAdded: "Naidagdag na!",
          transactionUpdated: "Na-update na!",
          transactionSavedMsg: "Matagumpay na nai-save ang transaksyon.",
          transactionDeleted: "Nabura na!",
          transactionDeletedMsg: "Natanggal na ang transaksyon.",
          savingsAllocated: "Nai-save ang transaksyon at {{amount}} ang inilalaan sa \"{{goal}}\".",
          savingsUpdated: "Na-update na!",
          savingsUpdatedMsg: "Matagumpay na na-update ang layunin sa pag-iipon.",
          savingsCreated: "Nalikha na!",
          savingsCreatedMsg: "Matagumpay na nalikha ang layunin sa pag-iipon.",
          limitReached: "Naabot na ang Limitasyon",
          limitReachedMsg: "Maaari ka lamang magkaroon ng 6 na aktibong layunin sa pag-iipon.",
          exportSuccess: "Na-export na!",
          exportSuccessMsg: "Matagumpay na na-download ang ulat sa pananalapi.",
          exportFailed: "Nabigo ang Pag-export",
          exportFailedMsg: "Hindi makabuo ng Excel report.",
          passwordReset: "Nai-reset na ang Password!",
          passwordResetMsg: "Matagumpay na nai-reset ang iyong password. Maaari ka nang mag-login gamit ang iyong bagong password.",
          budgetSaveError: "Nabigong i-save ang badyet",
          deleteTxTitle: "Burahin ang Transaksyon?",
          deleteTxHistoryMsg: "Tatanggalin nito ang transaksyon mula sa iyong kasaysayan ng badyet.",
          googleSignupError: "May maling nangyari sa Google signup. Subukan muli mamaya.",
          googleSignupInitError: "Nabigong simulan ang Google signup",
          googleLoginError: "May maling nangyari sa Google login. Subukan muli mamaya."
        },
        import: {
          title: "Mag-import ng mga Transaksyon",
          uploadTitle: "Mag-click upang mag-upload ng CSV",
          uploadDesc: "Kinakailangang column: Petsa, Pangalan, Halaga, Uri",
          removeBtn: "Alisin",
          showingPreview: "Ipinapakita ang unang 5 row",
          cancelBtn: "Kanselahin",
          importBtn: "Mag-import ng mga Transaksyon",
          processingBtn: "Pinoproseso...",
          defaultDescription: "Na-import sa pamamagitan ng CSV",
          errors: {
            invalidType: "Mangyaring mag-upload ng wastong CSV file.",
            invalidFormat: "Hindi wastong format ng CSV. Kinakailangang column: Petsa, Halaga, Uri, Pangalan/Paglalarawan",
            emptyFile: "Walang laman ang file.",
            parseError: "Error sa pag-parse ng file: {{error}}",
            rowError: "Ang Row {{row}} ay may hindi wastong halaga: \"{{amount}}\". Mangyaring gumamit lamang ng mga numero.",
            generic: "Nabigo ang pag-import"
          }
        },
        notifications: {
          budgetReached: "Naabot mo na ang 100% ng iyong inilalaang halaga para sa **{{name}}**",
          budgetWarning: "Nagamit mo na ang higit sa 85% ng iyong badyet sa **{{name}}**.",
          savingCompleted: "Binabati kita! Naabot mo na ang iyong layunin sa pag-iipon para sa **{{name}}**",
          savingWarning: "Nasa 85% ka na ng iyong layunin sa **{{name}}**!",
          default: "Bagong abiso"
        },
        reports: {
          header: {
            title: "Mga Ulat sa Pananalapi",
            subtitle: "Suriin ang iyong kalusugan sa pananalapi",
            exportBtn: "I-export ang Ulat"
          },
          stats: {
            income: "Kabuuang Kita",
            expenses: "Kabuuang Gastusin",
            net: "Net Balance"
          },
          filters: {
            thisMonth: "Ngayong Buwan",
            lastMonth: "Nakaraang Buwan",
            allTime: "Kahit Kailan",
            custom: "Pasadya",
            startDate: "Petsa ng Simula",
            endDate: "Petsa ng Pagtatapos"
          },
          charts: {
            expenseBreakdown: "Pagkakahati ng Gastusin",
            noExpenseData: "Walang data ng gastusin",
            incomeVsExpense: "Kita vs Gastusin",
            savingsPerformance: "Pagganap ng Ipon",
            totalSaved: "Kabuuang Naipon",
            inPeriod: "sa panahong ito",
            savingsRate: "Antas ng Pag-iipon",
            ofIncome: "ng kabuuang kita",
            topGoal: "Pangunahing Layunin",
            noSavings: "Walang aktibidad ng pag-iipon sa panahong ito",
            contributionsHint: "Lilitaw dito ang mga kontribusyon"
          },
          budgetCompliance: {
            title: "Pagsunod sa Badyet",
            headers: {
              name: "Pangalan ng Badyet",
              category: "Kategorya",
              allocated: "Nakalaan",
              spent: "Nagatos",
              remaining: "Natitira",
              status: "Katayuan"
            },
            empty: "Walang nakitang data ng badyet para sa panahong ito.",
            spent: "Nagatos",
            allocated: "Nakalaan"
          }
        },
      savings: {
          header: {
              title: "Mga Layunin sa Ipon",
              subtitle: "I-visualize ang iyong mga pangarap at subaybayan ang iyong pag-usad",
              createBtn: "Bagong Layunin"
          },
          stats: {
              totalSaved: "Kabuuang Ipon",
              topGoal: "Pangunahing Layunin",
              startGoal: "Magsimula ng Layunin",
              remaining: "Natitira"
          },
          filters: {
              searchPlaceholder: "Maghanap ng layunin sa ipon...",
              activeTab: "Aktibo",
              historyTab: "Kasaysayan",
              sortBy: {
                  newest: "Pinakabago",
                  targetAmount: "Target na Halaga",
                  currentAmount: "Kasalukuyang Halaga",
                  name: "Pangalan"
              },
              ascending: "Paakyat",
              descending: "Pababa"
          },
          activeList: {
              emptyTitle: "Walang aktibong layunin sa ipon",
              emptyDesc: "Magsimulang mag-ipon para sa iyong mga pangarap sa pamamagitan ng paggawa ng bagong layunin.",
              target: "Target",
              saved: "Naipon",
              created: "Ginawa",
              viewDetails: "Tingnan ang Detalye"
          },
          historyTable: {
              title: "Kasaysayan ng Ipon",
              subtitle: "Mga Natapos na Layunin",
              headers: {
                  name: "Pangalan",
                  target: "Target",
                  finalAmount: "Huling Halaga",
                  date: "Petsa",
                  status: "Katayuan",
                  actions: "Aksyon"
              },
              loading: "Naglo-load ng kasaysayan...",
              empty: "Walang kasaysayan ng ipon na natagpuan.",
              status: {
                  completed: "Natapos"
              },
              previous: "Nakaraan",
              next: "Susunod",
              page: "Pahina",
              of: "ng"
          },
          charts: {
              radial: {
                  title: "Pag-usad ng Layunin",
                  empty: "Walang aktibong layunin na ipapakita"
              },
              surplus: {
                  title: "Sobra sa Ipon",
                  subtitle: "Base ng Layunin vs. Bonus na Ipon",
                  targetMet: "Naabot ang Target",
                  surplus: "Sobra (Bonus)",
                  totalSaved: "Kabuuang Ipon",
                  noData: "Walang Data"
              },
              trend: {
                  title: "Pagganap ng Ipon",
                  subtitle: "Huling 10 layunin: Target vs. Aktwal na Naipon",
                  target: "Target",
                  saved: "Naipon"
              },
              growthTracker: {
                  title: "Tagasubaybay ng Paglago",
                  desc: "Panoorin ang paglago ng iyong ipon at subaybayan ang iyong pag-usad tungo sa mga layunin sa pananalapi."
              },
              tooltip: {
                  saved: "Naipon",
                  target: "Target",
                  completed: "Natapos"
              }
          },
          modal: {
              titleNew: "Bagong Layunin sa Ipon",
              titleEdit: "I-edit ang Layunin",
              targetLabel: "Target na Halaga ng Layunin",
              targetPlaceholder: "0.00",
              targetRequired: "Kinakailangan ang target na halaga",
              targetMin: "Dapat higit sa 0 ang target",
              nameLabel: "Pangalan ng Layunin",
              namePlaceholder: "hal. Bagong MacBook, Bakasyon",
              nameRequired: "Kinakailangan ang pangalan ng layunin",
              alreadySavedLabel: "May naipon na ba?",
              alreadySavedOptional: "(opsyonal)",
              currentMin: "Hindi maaaring negatibo",
              descriptionLabel: "Paglalarawan",
              descriptionPlaceholder: "Para saan ito?",
              preview: "Preview",
              complete: "Kumpleto",
              saveBtn: {
                  loading: "Nagse-save...",
                  update: "I-update ang Layunin",
                  create: "Itakda ang Layunin"
              },
              currentSaved: "Kasalukuyang Naipon",
              saveChanges: "I-save ang Pagbabago"
          },
          card: {
              completed: "Natapos",
              goalCompleted: "Natapos na ang Layunin",
              totalSaved: "Kabuuang Ipon",
              target: "Target",
              reached: "naabot",
              toGo: "Kulang pa",
              note: "Tala",
              historyTitle: "Kasaysayan ng Kontribusyon at Withdrawal",
              loadingHistory: "Naglo-load ng kasaysayan...",
              noHistory: "Walang kasaysayan ng kontribusyon",
              addBtn: "Magdagdag",
              withdrawBtn: "Mag-withdraw",
              cancelBtn: "Kanselahin",
              saved: "Naipon",
              withdrawn: "Na-withdraw",
              contribution: "Kontribusyon",
              withdrawal: "Withdrawal",
              overview: "Pangkalahatan",
              history: "Kasaysayan",
              deleteTx: "Burahin ang Transaksyon",
              syncing: "Nagsi-sync..."
          },
          alerts: {
              addContributionTitle: "Magdagdag ng Kontribusyon",
              addContributionPlaceholder: "Halagang idadagdag (e.g., 50.00)",
              availableBalance: "Magagamit na Netong Balanse",
              recordedAsExpense: "(Naitala bilang Gastos)",
              contributeBtn: "Mag-ambag",
              validAmount: "Mangyaring maglagay ng wastong halaga.",
              insufficientFunds: "Kulang ang pondo. Magagamit: ",
              contributionAddedTitle: "Naidagdag ang Kontribusyon!",
              contributionAddedMsg: "Ang {{amount}} ay naidagdag sa {{name}}.",
              withdrawTitle: "Mag-withdraw ng Pondo",
              withdrawPlaceholder: "Halagang iwi-withdraw",
              availableToWithdraw: "Magagamit para i-withdraw",
              recordedAsIncome: "(Naitala bilang Kita)",
              withdrawBtn: "Mag-withdraw",
              cannotWithdrawMore: "Hindi maaaring mag-withdraw ng higit sa naipon.",
              withdrawnDeletedTitle: "Na-withdraw at Nabura",
              withdrawnDeletedMsg: "Na-withdraw na ang {{amount}}. Nabura ang layunin dahil wala na itong laman.",
              withdrawnTitle: "Na-withdraw na!",
              withdrawnMsg: "Ang {{amount}} ay na-withdraw mula sa {{name}}.",
              errorTitle: "Error",
              addFailed: "Nabigo sa pagdagdag ng kontribusyon.",
              withdrawFailed: "Nabigo sa pag-withdraw ng pondo.",
              saveSuccessTitle: "Na-save!",
              saveSuccessMsg: "Matagumpay na na-update ang layunin.",
              saveErrorTitle: "Error",
              saveErrorMsg: "Nabigo sa pag-update ng layunin.",
              deleteTxTitle: "Burahin ang Transaksyon?",
              deleteTxMsg: "Ibabalik nito ang epekto sa balanse ng layuning ito.",
              deleteTxErrorTitle: "Error",
              deleteTxErrorMsg: "Nabigo sa pagbura ng transaksyon.",
              deleteTxBtn: "Oo, burahin ito",
              cancelBtn: "Kanselahin",
              deleteGoalTitle: "Burahin ang Layunin?",
              deleteGoalMsg: "Hindi na ito maibabalik.",
              returnFundsTitle: "Ibalik ang Pondo sa Balanse?",
              returnFundsMsg: "Ang layuning ito ay may {{count}} na transaksyon na nagkakahalaga ng {{amount}}. Ang pagbura nito ay magtatanggal sa mga transaksyon at ibabalik ang pera sa iyong Available Balance.",
              deleteSuccessTitle: "Nabura na",
              deleteSuccessMsg: "Matagumpay na nabura ang layunin.",
              returnSuccessMsg: "Nabura ang layunin at naibalik ang pondo sa balanse.",
              deleteGoalErrorTitle: "Error",
              deleteGoalErrorMsg: "Nabigo sa pagbura ng layunin o pagbalik ng transaksyon."
          }
      },
      },
      about: {
        title: "Tungkol sa Amin",
        intro: "Nasa misyon kaming gawing simple ang personal finance para sa lahat. Binuo ang MoneyTracker upang tulungan kang kontrolin ang iyong kinabukasan sa pananalapi.",
        values: [
          { title: "Komunidad Muna", desc: "Ginawa para sa totoong tao na may totoong layunin sa pera." },
          { title: "Kahusayan", desc: "Award-winning na disenyo at pamantayan sa seguridad." },
          { title: "Pandaigdigang Pananaw", desc: "Tinutulungan ang mga users sa buong mundo na magkaroon ng kalayaan sa pananalapi." }
        ],
        history: {
          p1: "Itinatag noong 2025, nagsimula ang MoneyTracker sa isang simpleng ideya: hindi dapat nakakatamad ang pag-budget. Naniniwala kami na kapag malinaw mong nakikita ang iyong pera, makakagawa ka ng mas magagandang desisyon.",
          p2: "Ang aming koponan ay binubuo ng mga eksperto sa pananalapi, designers, at engineers na masigasig sa paglikha ng mga tool na hindi lang makapangyarihan kundi masaya ring gamitin."
        }
      },
      careers: {
        title: "Sumali sa Aming Koponan",
        intro: "Tulungan kaming buuin ang kinabukasan ng personal finance. Naghahanap kami ng mga masigasig na indibidwal para sa aming remote-first team.",
        jobs: [
            { role: "Senior Frontend Engineer", dept: "Engineering", type: "Full-time", loc: "Remote" },
            { role: "Product Designer", dept: "Design", type: "Full-time", loc: "Remote" },
            { role: "Customer Success Manager", dept: "Operations", type: "Full-time", loc: "New York, NY" },
            { role: "Backend Developer (Laravel)", dept: "Engineering", type: "Contract", loc: "Remote" }
        ],
        cta: {
            title: "Wala ang hanap mo?",
            text: "Lagi kaming naghahanap ng talento. Ipadala ang resume sa careers@moneytracker.com",
            button: "Email Us"
        }
      },
      blog: {
        title: "Blog",
        subtitle: "Mga tips, tricks, at insights sa paghawak ng pera.",
        posts: [
            { title: "5 Paraan Para Mag-ipon Para sa Bahay sa 2025", excerpt: "Mga estratehiya para mapataas ang ipon nang hindi nagsasakripisyo.", date: "Dis 01, 2025", author: "Sarah J." },
            { title: "Pag-unawa sa 50/30/20 Rule", excerpt: "Ang klasikong pag-budget na ipinaliwanag para sa modernong panahon.", date: "Nob 28, 2025", author: "Mike T." },
            { title: "Bakit Kami Lumipat sa Serverless", excerpt: "Isang technical deep dive kung paano nag-i-scale ang MoneyTracker.", date: "Nob 15, 2025", author: "Dev Team" }
        ]
      },
      contact: {
        title: "Makipag-ugnayan",
        intro: "Gusto naming makarinig mula sa iyo. Nandito ang team namin para tumulong.",
        methods: [
            { title: "Chat Support", desc: "Ang pinakamabilis na paraan.", action: "Magsimula ng Chat" },
            { title: "Email Us", desc: "Magpadala ng detalyadong mensahe.", action: "support@moneytracker.com" },
            { title: "Telepono", desc: "Lun-Biy mula 8am hanggang 5pm.", action: "+1 (555) 000-0000" }
        ],
        form: {
            title: "Magpadala ng mensahe",
            firstName: "Pangalan",
            lastName: "Apelyido",
            email: "Email",
            message: "Mensahe",
            button: "Ipadala"
        }
      },
      privacy: {
        title: "Patakaran sa Privacy",
        lastUpdated: "Huling na-update: Disyembre 05, 2025",
        intro: "Sa MoneyTracker, sineseryoso namin ang iyong privacy. Ipinapaliwanag ng policy na ito kung paano namin kinokolekta at ginagamit ang iyong impormasyon.",
        sections: [
            { title: "Impormasyong Kinokolekta Namin", content: "Kinokolekta namin ang impormasyong boluntaryo mong ibinibigay kapag nagrerehistro ka o nagpapakita ng interes sa aming produkto." },
            { title: "Paano Namin Ginagamit ang Iyong Impormasyon", content: "Ang pagkakaroon ng tumpak na impormasyon ay nagbibigay-daan sa amin para makapagbigay ng maayos at customized na karanasan." },
            { title: "Pagsisiwalat ng Iyong Impormasyon", content: "Maaari kaming magbahagi ng impormasyon sa mga third-party service providers o kung kinakailangan ng batas." }
        ],
        contact: {
            title: "Makipag-ugnayan",
            text: "Kung may tanong ka tungkol sa Privacy Policy, kontakin kami sa:"
        }
      },
      terms: {
        title: "Mga Tuntunin ng Serbisyo",
        lastUpdated: "Huling na-update: Disyembre 05, 2025",
        intro: "Basahin nang mabuti ang mga Tuntunin bago gamitin ang MoneyTracker website at app.",
        sections: [
            { title: "Accounts", content: "Kapag gumawa ka ng account, dapat tumpak at kumpleto ang impormasyon mo. Ang hindi pagsunod ay paglabag sa Tuntunin." },
            { title: "Intellectual Property", content: "Ang Serbisyo at ang orihinal na nilalaman nito ay mananatiling pag-aari ng MoneyTracker." },
            { title: "Pagwawakas", content: "Maaari naming itigil o suspindihin ang access sa Serbisyo agad kung lalabagin mo ang mga Tuntunin." }
        ],
        contact: {
            title: "May Tanong?",
            text: "Kung may tanong ka tungkol sa Terms, kontakin kami sa:"
        }
      }
    }
  },
  zh: {
    translation: {
      landing: {
        hero: {
          version: "v2.0 现已上线",
          title: "掌握您的财富，",
          highlight: "轻而易举。",
          subtitle: "使用我们就直观的金融工具，追踪、储蓄并增值您的财富。",
          cta: "免费开始",
          secondaryCta: "观看演示",
          lovedBy: "受到 10,000+ 用户喜爱",
          card: {
              totalBalance: "总余额",
              savingsGoal: "储蓄目标",
              budgetStatus: "预算状态",
              onTrack: "正常"
          }
        },
        features: {
          title: "您所需要的一切，",
          highlight: "建立财富。",
          subtitle: "强大的工具助您掌控财务未来，封装在简单直观的界面中。",
          items: {
            dashboard: { title: "交互式仪表板", desc: "全面了解您的财务状况。实时追踪收入、支出和储蓄。" },
            budgeting: { title: "智能预算", desc: "为每个类别设定每月限额。我们会追踪您的支出并在接近限额时提醒您。" },
            goals: { title: "目标追踪", desc: "为您的梦想创建自定义储蓄目标。追踪进度并更快达成目标。" },
            reports: { title: "详细报告", desc: "通过全面的细分和可导出的报告分析您的消费习惯。" }
          }
        },
        testimonials: {
            title: "受到",
            highlight: "成千上万人的喜爱",
            subtitle: "不仅仅是我们这么说。看看我们的社区怎么说。",
            items: [
                {name: "Sarah Johnson", role: "自由设计师", quote: "MoneyTracker 完全改变了我管理自由职业收入的方式。税务估算功能简直是救星！"},
                {name: "Michael Chen", role: "软件工程师", quote: "它是用过最干净的预算应用。没有杂乱，只有我增值储蓄所需的见解。"},
                {name: "Emily Davis", role: "小企业主", quote: "我终于明白钱去哪儿了。可视化报告非常漂亮，而且很容易理解。"}
            ]
        },
        currencySymbol: "¥",
        nav: {
          login: "登录",
          signup: "注册",
          menu: {
            features: "功能",
            testimonials: "评价",
            faq: "常见问题"
          }
        },
        security: {
          badge: "银行级安全",
          title: "您的数据安全",
          highlight: "无忧。",
          subtitle: "我们非常重视安全。从您注册的那一刻起，您的财务数据就受到行业领先安全协议的保护。",
          items: [
            { title: "安全验证", desc: "由 Laravel Sanctum 提供强大的令牌保护。" },
            { title: "密码哈希", desc: "密码使用 Bcrypt/Argon2 标准进行哈希处理。我们永远看不到您的密码。" },
            { title: "数据隐私", desc: "您的数据属于您。我们绝不出售或分享您的个人信息。" }
          ],
          card: {
            statusTitle: "安全状态",
            status: "活跃 & 监控中",
            encryption: "加密",
            database: "数据库",
            isolated: "隔离 & 保护",
            backups: "备份",
            daily: "每日加密"
          }
        },
        roadmap: {
          title: "构建",
          highlight: "未来",
          subtitle: "我们不断改进。以下是 MoneyTracker 接下来的计划。",
          items: [
            { quarter: "2026 第一季度", title: "数据导出", desc: "下载 CSV 和 PDF 格式的完整财务历史记录以便报税。", status: "进行中" },
            { quarter: "2026 第二季度", title: "经常性交易", desc: "设置自动经常性收入和支出，无需手动输入账单。", status: "计划中" },
            { quarter: "2026 第三季度", title: "多货币", desc: "使用实时汇率追踪 USD、PHP 和 CNY 资产。", status: "计划中" }
          ]
        },
        faq: {
          title: "常见问题",
          subtitle: "有疑问？我们有答案。",
          items: [
            { question: "MoneyTracker 真的免费吗？", answer: "是的！我们的核心功能永久免费。我们也为需要高级自动化功能的重度用户提供高级计划。" },
            { question: "我的财务数据安全吗？", answer: "我们优先考虑您的安全。您的密码使用行业标准进行哈希处理，我们绝不会将您的个人信息出售给第三方。" },
            { question: "我可以导出我的数据吗？", answer: "是的，您可以随时将交易记录和报告导出为 CSV 或 PDF 格式。" },
            { question: "它连接到我的银行账户吗？", answer: "目前，为了最大程度的隐私和控制，我们专注于手动输入，但我们正在开发可选的银行同步功能。" }
          ]
        },
        cta_section: {
          title: "准备好掌控一切了吗？",
          subtitle: "加入成千上万的用户，使用 MoneyTracker 构建更美好的财务未来。",
          button: "创建免费账户",
          disclaimer: "无需信用卡 • 提供永久免费计划"
        },
        footer: {
          description: "管理个人财务的最明智方式。构建时考虑到安全性和简单性。",
          headers: {
            product: "产品",
            company: "公司"
          },
          links: {
            features: "功能",
            security: "安全",
            roadmap: "路线图",
            about: "关于",
            careers: "职业",
            blog: "博客",
            contact: "联系我们",
            privacy: "隐私政策",
            terms: "服务条款"
          },
          copyright: "© 2025 MoneyTracker. 保留所有权利。"
        }
      },
      common: {
        backToHome: "返回首页"
      },
      app: {
        sidebar: {
          overview: "概览",
          tracking: "追踪",
          management: "管理",
          insights: "洞察",
          system: "系统",
          items: {
            dashboard: "仪表板",
            transactions: "交易",
            budgets: "预算",
            savings: "储蓄",
            reports: "报告",
            settings: "设置"
          }
        },
        topbar: {
          notifications: "通知",
          noNotifications: "没有新通知",
          justNow: "刚刚",
          accountSettings: "账户设置",
          signOut: "退出登录",
          logoutModal: {
            title: "退出登录？",
            text: "您确定要结束会话吗？",
            confirm: "退出登录"
          }
        },
        footer: {
          rights: "保留所有权利",
          followUs: "关注我们："
        },
        dashboard: {
          welcome: "欢迎回来，{{name}}",
          stats: {
            income: "总收入",
            expenses: "总支出",
            netBalance: "净余额",
            totalSavings: "总储蓄"
          },
          charts: {
            title: "财务概览",
            subtitle: "收入、支出和储蓄（过去 7 天）",
            income: "收入",
            expense: "支出",
            savings: "储蓄"
          },
          recentActivity: {
            title: "近期活动",
            subtitle: "最新交易",
            noTransactions: "无近期交易",
            syncing: "同步中..."
          },
          budgets: {
            title: "活跃预算",
            subtitle: "支出限额",
            noBudgets: "没有活跃预算。设置限额以追踪支出。",
            limit: "限额",
            overBy: "超出",
            left: "剩余"
          },
          savings: {
            title: "储蓄目标",
            subtitle: "追踪您的梦想",
            noGoals: "没有活跃的储蓄目标。开始为您的梦想储蓄。",
            target: "目标"
          }
        },
        transactions: {
            header: {
              title: "交易记录",
              subtitle: "管理您的财务记录",
              addBtn: "添加交易",
              importBtn: "导入",
              exportBtn: "导出"
            },
            stats: {
              totalIncome: "总收入",
              totalExpenses: "总支出",
              netBalance: "净余额"
            },
            filters: {
              searchPlaceholder: "搜索交易...",
              filterBtn: "筛选",
              clearBtn: "清除",
              categoryPlaceholder: "所有类别",
              type: {
                all: "所有类型",
                income: "收入",
                expense: "支出"
              },
              date: {
                all: "全部时间",
                today: "今天",
                yesterday: "昨天",
                last7: "过去 7 天",
                last30: "过去 30 天",
                thisMonth: "本月",
                lastMonth: "上月",
                custom: "自定义范围",
                sortByDate: "按日期排序",
                sortByAmount: "按金额排序",
                sortByCreated: "按创建时间排序"
              }
            },
            table: {
              title: "交易历史",
              subtitle: "所有交易",
              headers: {
                date: "日期",
                category: "类别",
                description: "名称和描述",
                amount: "金额",
                type: "类型",
                actions: "操作"
              },
              empty: "未找到交易",
              syncing: "同步中...",
              editingDisabled: "创建 1 小时后无法编辑",
              editTooltip: "编辑交易",
              prev: "上一页",
              next: "下一页",
              page: "页",
              of: "共",
              actions: {
                edit: "编辑",
                delete: "删除"
              }
            },
            modal: {
              titleNew: "新建交易",
              titleEdit: "编辑交易",
              income: "收入",
              expense: "支出",
              date: "日期",
              category: "类别",
              description: "描述",
              namePlaceholder: "这是什么？",
              notePlaceholder: "添加备注（可选）",
              save: "保存更改",
              add: "添加交易",
              required: "必填",
              noteTime: "注意：交易仅能在创建后 1 小时内编辑。",
              selectCategory: "选择",
              allocateSavings: "分配储蓄",
              selectGoal: "选择目标",
              chooseGoal: "选择一个目标...",
              progress: "进度：",
              amount: "金额",
              percent: "百分比 (%)",
              budgetStatus: {
                over: "超出",
                onTrack: "正常",
                spent: "已用",
                left: "剩余"
              }
            }
            },
        budgets: {
          header: {
            title: "预算",
            subtitle: "规划、追踪并为未来储蓄",
            createBtn: "创建预算"
          },
          stats: {
            activeAllocated: "当前分配",
            historyAllocated: "历史分配",
            activeSpent: "当前支出",
            historySpent: "历史支出",
            activeCount: "当前数量",
            historyCount: "历史数量"
          },
          filters: {
            searchPlaceholder: "搜索预算...",
            activeTab: "活跃",
            historyTab: "历史",
            allCategories: "所有类别",
            sortBy: {
              newest: "最新",
              endDate: "结束日期",
              amount: "金额",
              name: "名称"
            },
            ascending: "升序",
            descending: "降序"
          },
          list: {
            emptyTitle: "未找到活跃预算",
            emptyDesc: "尝试调整筛选条件或创建一个新预算开始追踪。",
            allocated: "已分配",
            spent: "已支出",
            viewDetails: "查看详情",
            noActive: "未找到活跃预算"
          },
          history: {
            title: "预算历史",
            subtitle: "已完成 & 已过期",
            headers: {
              name: "名称",
              category: "类别",
              allocated: "已分配",
              spent: "已支出",
              status: "状态",
              actions: "操作"
            },
            loading: "加载历史记录...",
            empty: "未找到符合条件的预算历史。",
            previous: "上一页",
            next: "下一页",
            page: "页",
            of: "共"
          },
          modal: {
            titleNew: "新建预算",
            titleEdit: "编辑预算",
            limitLabel: "预算限额",
            nameLabel: "预算名称",
            namePlaceholder: "例如：每月杂货",
            descriptionPlaceholder: "添加备注（可选）",
            categoryLabel: "类别",
            selectCategory: "选择类别",
            startDateLabel: "开始日期",
            endDateLabel: "结束日期",
            duration: "时长：",
            createBtn: "创建预算",
            updateBtn: "更新预算",
            activeCategory: "(活跃)",
            validation: {
              amountRequired: "金额为必填项",
              amountMin: "必须大于 0",
              nameRequired: "名称为必填项",
              nameMax: "最多 100 个字符",
              categoryRequired: "类别为必填项",
              endDateRequired: "结束日期为必填项",
              endDatePast: "不能是过去的时间",
              endDateBeforeStart: "必须在开始日期之后"
            },
            saving: "保存中...",
            durationValues: {
              invalid: "无效时长",
              day: "天",
              days: "天"
            }
          },
          card: {
            expired: "已过期",
            overview: "概览",
            history: "历史",
            overBudgetBy: "超出预算",
            remainingBudget: "剩余预算",
            criticalOverspend: "严重超支",
            used: "已使用",
            allocated: "已分配",
            spent: "已支出",
            note: "备注",
            historyTitle: "交易历史",
            loadingHistory: "加载交易中...",
            noTransactions: "暂无交易",
            cancel: "取消",
            noDate: "无日期"
          },
          statusLabels: {
            overspent: "超支",
            limitReached: "达到限额",
            completed: "已完成",
            expired: "已过期",
            nearLimit: "接近限额",
            active: "活跃"
          },
          charts: {
            budgetVsSpent: "预算 vs. 支出",
            allocated: "已分配",
            spent: "已支出",
            spendingOverview: "支出概览",
            spendingOverviewDesc: "可视化您的预算分配和消费习惯，保持在正轨上。",
            successRate: "成功率",
            successRateDesc: "保持在限额内的预算",
            underBudget: "低于预算",
            overBudget: "超出预算",
            spendingTrend: "支出趋势",
            spendingTrendDesc: "最近10次预算：计划 vs. 实际",
            limit: "限额",
            totalActiveBudgets: "活跃预算总额",
            budgetsCount: "{{count}} 个预算"
          },
          alerts: {
            deleteBudgetTitle: "删除预算？",
            deleteBudgetMsg: "此操作无法撤消。",
            deletePreserveTitle: "删除并保留历史记录？",
            deletePreserveMsg: "此预算有 {{count}} 笔交易。它们将被取消链接，但会保留在您的历史记录中。",
            confirmDeleteBtn: "是的，删除它",
            cancelBtn: "取消",
            deleteSuccessTitle: "已删除！",
            deleteSuccessMsg: "预算已成功删除。",
            deleteErrorTitle: "错误",
            deleteErrorMsg: "删除预算失败。",
            deleteTxSuccessTitle: "已删除！",
            deleteTxSuccessMsg: "交易已成功删除。",
            deleteTxErrorTitle: "错误",
            deleteTxErrorMsg: "删除交易失败。"
          }
        },
        settings: {
          header: {
            title: "设置",
            subtitle: "管理您的帐户首选项和安全性"
          },
          sidebar: {
            profile: "个人资料",
            security: "安全",
            notifications: "通知",
            app: "应用设置"
          },
          profile: {
            title: "您的个人资料",
            subtitle: "在这里更新您的照片和个人详细信息。",
            fullName: "全名",
            email: "电子邮件地址",
            language: "语言",
            currency: "货币",
            namePlaceholder: "输入您的全名",
            emailImmutable: "电子邮件地址无法更改。",
            saveBtn: "保存更改",
            savingBtn: "保存中..."
          },
          security: {
            setPw: {
              title: "设置密码",
              desc: "您目前通过 Google 登录。您不需要密码，但如果您想使用电子邮件/密码登录，可以设置一个。",
              submit: "设置密码"
            },
            changePw: {
              title: "更改密码",
              desc: "更新您的密码以确保帐户安全。",
              current: "当前密码",
              forgot: "忘记密码？",
              new: "新密码",
              confirm: "确认新密码",
              submit: "更改密码"
            },
            validation: {
              required: "必须填写密码",
              min: "密码必须至少 8 个字符",
              confirmReq: "请确认您的密码",
              match: "密码不匹配",
              currentReq: "必须填写当前密码"
            },
            danger: {
              title: "危险区域",
              deleteTitle: "删除帐户",
              deleteDesc: "永久删除您的帐户和所有相关数据。此操作无法撤消。",
              deleteBtn: "删除帐户"
            },
            alerts: {
              pwSetTitle: "密码已设置！",
              pwSetMsg: "您现在可以使用电子邮件和密码登录。",
              pwChangeTitle: "密码已更改！",
              pwChangeMsg: "您的密码已成功更新。",
              error: "错误"
            }
          },
          notifications: {
            title: "通知首选项",
            subtitle: "管理您接收通知的方式。",
            emailTitle: "电子邮件通知",
            emailDesc: "接收有关帐户活动和更新的电子邮件。"
          },
          app: {
            title: "外观",
            subtitle: "自定义应用程序在您设备上的显示方式。",
            light: "浅色",
            lightDesc: "简洁明亮的界面",
            dark: "深色",
            darkDesc: "低光环境下护眼",
            system: "系统",
            systemDesc: "匹配您的设备设置"
          }
        },
        swal: {
          confirmTitle: "您确定吗？",
          confirmText: "此操作无法撤消。",
          confirmBtn: "是的，删除它",
          cancelBtn: "取消",
          yesBtn: "是的",
          successTitle: "成功",
          errorTitle: "错误",
          errorText: "出错了",
          infoTitle: "信息",
          warningTitle: "警告",
          okBtn: "确定",
          // New keys
          importSuccess: "成功导入 {{count}} 笔交易。",
          loginSuccess: "登录成功！欢迎回来！",
          settingsSaved: "设置已保存！",
          settingsSavedMsg: "您的偏好已成功更新。",
          accountDeleted: "已删除！",
          accountDeletedMsg: "您的帐户已被删除。",
          preferencesUpdated: "偏好已更新",
          emailEnabled: "已启用电子邮件通知",
          emailDisabled: "已禁用电子邮件通知",
          verificationSent: "验证邮件已发送。请检查您的收件箱。",
          transactionAdded: "已添加！",
          transactionUpdated: "已更新！",
          transactionSavedMsg: "交易已成功保存。",
          transactionDeleted: "已删除！",
          transactionDeletedMsg: "交易已被移除。",
          savingsAllocated: "交易已保存，{{amount}} 已分配给 \"{{goal}}\"。",
          savingsUpdated: "已更新！",
          savingsUpdatedMsg: "储蓄目标已成功更新。",
          savingsCreated: "已创建！",
          savingsCreatedMsg: "储蓄目标已成功创建。",
          limitReached: "达到限制",
          limitReachedMsg: "通过一次只能有 6 个活跃的储蓄目标。",
          exportSuccess: "已导出！",
          exportSuccessMsg: "财务报告已成功下载。",
          exportFailed: "导出失败",
          exportFailedMsg: "无法生成 Excel 报告。",
          passwordReset: "密码已重置！",
          passwordResetMsg: "您的密码已成功重置。您现在可以使用新密码登录。",
          budgetSaveError: "保存预算失败",
          deleteTxTitle: "删除交易？",
          deleteTxHistoryMsg: "这将从您的预算历史记录中将其删除。",
          googleSignupError: "Google 注册出错了。请稍后再试。",
          googleSignupInitError: "无法启动 Google 注册",
          googleLoginError: "Google 登录出错了。请稍后再试。"
        },
        import: {
          title: "导入交易",
          uploadTitle: "点击上传 CSV",
          uploadDesc: "所需列：日期、名称、金额、类型",
          removeBtn: "移除",
          showingPreview: "显示前 5 行",
          cancelBtn: "取消",
          importBtn: "导入交易",
          processingBtn: "处理中...",
          defaultDescription: "通过 CSV 导入",
          errors: {
            invalidType: "请上传有效的 CSV 文件。",
            invalidFormat: "无效的 CSV 格式。所需列：日期、金额、类型、名称/描述",
            emptyFile: "文件为空。",
            parseError: "解析文件错误：{{error}}",
            rowError: "第 {{row}} 行金额无效：\"{{amount}}\"。请仅使用数字。",
            generic: "导入失败"
          }
        },
        notifications: {
          budgetReached: "您已达到 **{{name}}** 分配金额的 100%",
          budgetWarning: "您的 **{{name}}** 预算已使用超过 85%。",
          savingCompleted: "恭喜！您已达到 **{{name}}** 的储蓄目标",
          savingWarning: "您已完成 **{{name}}** 目标的 85%！",
          default: "新通知"
        },
        reports: {
          header: {
            title: "财务报告",
            subtitle: "深入了解您的财务状况",
            exportBtn: "导出报告"
          },
          stats: {
            income: "总收入",
            expenses: "总支出",
            net: "净余额"
          },
          filters: {
            thisMonth: "本月",
            lastMonth: "上月",
            allTime: "所有时间",
            custom: "自定义",
            startDate: "开始日期",
            endDate: "结束日期"
          },
          charts: {
            expenseBreakdown: "支出明细",
            noExpenseData: "无可用支出数据",
            incomeVsExpense: "收入与支出",
            savingsPerformance: "储蓄表现",
            totalSaved: "已储蓄总额",
            inPeriod: "在此期间",
            savingsRate: "储蓄率",
            ofIncome: "占总收入",
            topGoal: "主要目标",
            noSavings: "在此期间无储蓄活动",
            contributionsHint: "存款将显示在这里"
          },
          budgetCompliance: {
            title: "预算合规性",
            headers: {
              name: "预算名称",
              category: "类别",
              allocated: "已分配",
              spent: "已支出",
              remaining: "剩余",
              status: "状态"
            },
            empty: "未找到此期间的预算数据。",
            spent: "已支出",
            allocated: "已分配"
          }
        },
      savings: {
          header: {
              title: "储蓄目标",
              subtitle: "可视化您的梦想并追踪进度",
              createBtn: "新目标"
          },
          stats: {
              totalSaved: "储蓄总额",
              topGoal: "首要目标",
              startGoal: "开始一个目标",
              remaining: "剩余"
          },
          filters: {
              searchPlaceholder: "搜索储蓄目标...",
              activeTab: "活跃",
              historyTab: "历史",
              sortBy: {
                  newest: "最新",
                  targetAmount: "目标金额",
                  currentAmount: "当前金额",
                  name: "名称"
              },
              ascending: "升序",
              descending: "降序"
          },
          activeList: {
              emptyTitle: "没有活跃的储蓄目标",
              emptyDesc: "通过创建一个新目标开始为您的梦想储蓄。",
              target: "目标",
              saved: "已存",
              created: "创建于",
              viewDetails: "查看详情"
          },
          historyTable: {
              title: "储蓄历史",
              subtitle: "已完成目标",
              headers: {
                  name: "名称",
                  target: "目标",
                  finalAmount: "最终金额",
                  date: "日期",
                  status: "状态",
                  actions: "操作"
              },
              loading: "加载历史记录...",
              empty: "未找到储蓄历史。",
              status: {
                  completed: "已完成"
              },
              previous: "上一页",
              next: "下一页",
              page: "页",
              of: "共"
          },
          charts: {
              radial: {
                  title: "目标进度",
                  empty: "没有活跃目标显示"
              },
              surplus: {
                  title: "储蓄盈余",
                  subtitle: "基础目标 vs. 额外储蓄",
                  targetMet: "达成目标",
                  surplus: "盈余（奖金）",
                  totalSaved: "储蓄总额",
                  noData: "无数据"
              },
              trend: {
                  title: "储蓄表现",
                  subtitle: "最近 10 个目标：目标 vs. 实际储蓄",
                  target: "目标",
                  saved: "已存"
              },
              growthTracker: {
                  title: "增长追踪",
                  desc: "观察您的储蓄增长并追踪迈向财务目标的进度。"
              },
              tooltip: {
                  saved: "已存",
                  target: "目标",
                  completed: "已完成"
              }
          },
          modal: {
              titleNew: "新储蓄目标",
              titleEdit: "编辑目标",
              targetLabel: "目标金额",
              targetPlaceholder: "0.00",
              targetRequired: "目标金额为必填项",
              targetMin: "目标必须大于 0",
              nameLabel: "目标名称",
              namePlaceholder: "例如：新 MacBook，度假",
              nameRequired: "目标名称为必填项",
              alreadySavedLabel: "已有储蓄？",
              alreadySavedOptional: "（可选）",
              currentMin: "不能为负数",
              descriptionLabel: "描述",
              descriptionPlaceholder: "这是为了什么？",
              preview: "预览",
              complete: "完成",
              saveBtn: {
                  loading: "保存中...",
                  update: "更新目标",
                  create: "设置目标"
              },
              currentSaved: "当前已存",
              saveChanges: "保存更改"
          },
          card: {
              completed: "已完成",
              goalCompleted: "目标已完成",
              totalSaved: "储蓄总额",
              target: "目标",
              reached: "已达成",
              toGo: "还需",
              note: "备注",
              historyTitle: "存款和取款历史",
              loadingHistory: "加载历史记录...",
              noHistory: "没有存款记录",
              addBtn: "添加",
              withdrawBtn: "取款",
              cancelBtn: "取消",
              saved: "已存",
              withdrawn: "已取",
              contribution: "存款",
              withdrawal: "取款",
              overview: "概览",
              history: "历史",
              deleteTx: "删除交易",
              syncing: "同步中..."
          },
          alerts: {
              addContributionTitle: "添加存款",
              addContributionPlaceholder: "添加金额 (例如: 50.00)",
              availableBalance: "可用净余额",
              recordedAsExpense: "(记录为支出)",
              contributeBtn: "存入",
              validAmount: "请输入有效金额。",
              insufficientFunds: "资金不足。可用: ",
              contributionAddedTitle: "存款已添加!",
              contributionAddedMsg: "{{amount}} 已添加到 {{name}}。",
              withdrawTitle: "提取资金",
              withdrawPlaceholder: "提取金额",
              availableToWithdraw: "可提取金额",
              recordedAsIncome: "(记录为收入)",
              withdrawBtn: "提取",
              cannotWithdrawMore: "提取金额不能超过储蓄总额。",
              withdrawnDeletedTitle: "已提取并删除",
              withdrawnDeletedMsg: "已提取 {{amount}}。由于目标为空，已将其删除。",
              withdrawnTitle: "已提取!",
              withdrawnMsg: "已从 {{name}} 提取 {{amount}}。",
              errorTitle: "错误",
              addFailed: "添加存款失败。",
              withdrawFailed: "提取资金失败。",
              saveSuccessTitle: "已保存!",
              saveSuccessMsg: "目标更新成功。",
              saveErrorTitle: "错误",
              saveErrorMsg: "更新目标失败。",
              deleteTxTitle: "删除交易?",
              deleteTxMsg: "这将撤销此目标上的余额变动。",
              deleteTxErrorTitle: "错误",
              deleteTxErrorMsg: "删除交易失败。",
              deleteTxBtn: "是的，删除它",
              cancelBtn: "取消",
              deleteGoalTitle: "删除目标？",
              deleteGoalMsg: "此操作无法撤消。",
              returnFundsTitle: "将资金返还至余额？",
              returnFundsMsg: "此目标有 {{count}} 笔交易，总计 {{amount}}。删除此目标将移除这些交易并将资金返还至您的可用余额。",
              deleteSuccessTitle: "已删除",
              deleteSuccessMsg: "目标已成功删除。",
              returnSuccessMsg: "目标已删除，资金已返还至余额。",
              deleteGoalErrorTitle: "错误",
              deleteGoalErrorMsg: "删除目标或返还交易失败。"
          }
      },
      },
      about: {
        title: "关于我们",
        intro: "我们的使命是让每个人的个人理财变得简单。MoneyTracker 旨在帮助您掌控您的财务未来。",
        values: [
          { title: "社区至上", desc: "为有真实财务目标的真实人群打造。" },
          { title: "卓越", desc: "屡获殊荣的设计和安全标准。" },
          { title: "全球视野", desc: "帮助全球用户实现财务自由。" }
        ],
        history: {
          p1: "MoneyTracker 成立于 2025 年，始于一个简单的想法：预算不应该是枯燥的。我们相信，当您能清楚地看到您的钱时，您就能做出更好的决定。",
          p2: "我们的团队由金融专家、设计师和工程师组成，他们热衷于创造不仅功能强大而且使用愉悦的工具。"
        }
      },
      careers: {
        title: "加入我们的团队",
        intro: "帮助我们构建个人理财的未来。我们正在寻找充满激情的人才加入我们的远程优先团队。",
        jobs: [
            { role: "资深前端工程师", dept: "工程部", type: "全职", loc: "远程" },
            { role: "产品设计师", dept: "设计部", type: "全职", loc: "远程" },
            { role: "客户成功经理", dept: "运营部", type: "全职", loc: "纽约" },
            { role: "后端开发人员 (Laravel)", dept: "工程部", type: "合同工", loc: "远程" }
        ],
        cta: {
            title: "没有合适的职位？",
            text: "我们一直在寻找人才。请将您的简历发送至 careers@moneytracker.com",
            button: "发邮件给我们"
        }
      },
      blog: {
        title: "博客",
        subtitle: "掌握财富的技巧、诀窍和见解。",
        posts: [
            { title: "2025 年为买房储蓄的 5 种方法", excerpt: "在不牺牲生活质量的情况下提高储蓄率的策略。", date: "2025年12月1日", author: "Sarah J." },
            { title: "理解 50/30/20 规则", excerpt: "为现代财务解释的经典预算规则。", date: "2025年11月28日", author: "Mike T." },
            { title: "为什么我们转向 Serverless", excerpt: "关于 MoneyTracker 如何扩展的技术深度剖析。", date: "2025年11月15日", author: "Dev Team" }
        ]
      },
      contact: {
        title: "联系我们",
        intro: "我们很乐意听取您的意见。我们的团队随时为您服务。",
        methods: [
            { title: "在线聊天", desc: "获得帮助的最快方式。", action: "开始聊天" },
            { title: "发邮件", desc: "发送详细信息。", action: "support@moneytracker.com" },
            { title: "电话", desc: "周一至周五 上午8点至下午5点", action: "+1 (555) 000-0000" }
        ],
        form: {
            title: "发送消息",
            firstName: "名",
            lastName: "姓",
            email: "电子邮箱",
            message: "消息",
            button: "发送消息"
        }
      },
      privacy: {
        title: "隐私政策",
        lastUpdated: "最后更新：2025年12月05日",
        intro: "在 MoneyTracker，我们非常重视您的隐私。本隐私政策说明了我们如何收集、使用、披露和保护您的信息。",
        sections: [
            { title: "我们收集的信息", content: "我们收集您在注册应用程序、表示有兴趣获取有关我们或我们产品和服务的信息时自愿提供给我们的信息。" },
            { title: "我们如何使用您的信息", content: "拥有关于您的准确信息使我们能够为您提供顺畅、高效和定制的体验。" },
            { title: "您的信息的披露", content: "我们可能会在某些情况下分享我们收集的关于您的信息。您的信息可能会如下披露：根据法律或为了保护权利，第三方服务提供商。" }
        ],
        contact: {
            title: "联系我们",
            text: "如果您对本隐私政策有任何疑问或意见，请联系我们："
        }
      },
      terms: {
        title: "服务条款",
        lastUpdated: "最后更新：2025年12月05日",
        intro: "在使用 MoneyTracker 网站和移动应用程序之前，请仔细阅读这些服务条款。",
        sections: [
            { title: "账户", content: "当您向我们创建账户时，您必须始终向我们提供准确、完整和最新的信息。否则将构成对条款的违反。" },
            { title: "知识产权", content: "服务及其原始内容、功能和特性是并将继续是 MoneyTracker 及其许可方的专有财产。" },
            { title: "终止", content: "我们可以以任何理由（包括但不限于您违反条款）立即终止或暂停访问我们的服务，恕不另行通知或承担责任。" }
        ],
        contact: {
            title: "有问题？",
            text: "如果您对这些条款有任何疑问，请联系我们："
        }
      }
    }
  },
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: false, // helpful for debugging
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
