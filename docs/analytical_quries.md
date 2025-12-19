# Користувачі, які не логінилися в свій аккаунт протягом довгого часу

Користувачі, які зареєструвалися, але, ніколи не логінилися протягом одного року.

```sql
SELECT 
  u.email, 
  u.first_name || u.last_name AS full_name, 
  u.created_at
FROM users u
LEFT JOIN tokens tk on u.id = tk.user_id
GROUP BY u.id
HAVING tk.expire < NOW() - INTERVAL '1 year' OR COUNT(tk.id) = 0;
```

# Топ-10 найбільших одноразових переказів

Хто робить найбільше транзакцій в системі.

```sql
SELECT 
  t.name AS transaction_name
  u.first_name || u.last_name AS full_name
  tr.amount
FROM transfers tr
  JOIN transactions t on tr.transaction_id = t.id
  JOIN accounts a ON tr.account_id = a.id
  JOIN users u on t.name LIKE 'user_' || u.id
WHERE tr.amount > 0 
ORDER BY tr.amount DESC
LIMIT 10;
```

# Порахувати середні показники по системі

Порахувати: середній чек, кількість списань, загальну суму виходу

```sql
SELECT 
  ROUND(AVG(system.personal_avg_check), 2) AS avg_check,
  ROUND(AVG(system.personal_tx_count), 1) AS avg_withdrawal_count,
  ROUND(SUM(system.personal_total_out), 2) AS total_out
FROM (
  SELECT 
    ABS(AVG(tr.amount)) as personal_avg_check,
    COUNT(tr.transaction_id) as personal_tx_count,
    SUM(ABS(tr.amount)) as personal_total_out
  FROM transfers tr
  WHERE tr.amount < 0
  GROUP BY tr.account_id
) AS system;
```
