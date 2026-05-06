CREATE DATABASE StrategyDB;
USE StrategyDB;

-- USERS
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    available_capital DECIMAL(18,2) NOT NULL DEFAULT 0.00
);

-- STRATEGIES
CREATE TABLE Strategies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    risk_level ENUM('Low','Medium','High') NOT NULL,
    return_percentage DECIMAL(5,2) NOT NULL,
    min_capital DECIMAL(18,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- SUBSCRIPTIONS
CREATE TABLE Subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    strategy_id INT NOT NULL,
    allocated_capital DECIMAL(18,2) NOT NULL,
    status ENUM('Active','Paused','Cancelled') NOT NULL DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (strategy_id) REFERENCES Strategies(id)
);

--------------------------------------------------
-- TRIGGER (BEFORE INSERT)
--------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_before_subscription_insert
BEFORE INSERT ON Subscriptions
FOR EACH ROW
BEGIN
    DECLARE strategy_min_capital DECIMAL(18,2);
    DECLARE user_avail_capital DECIMAL(18,2);
    DECLARE current_allocated DECIMAL(18,2);
    DECLARE active_count INT;

    -- Duplicate active check
    IF NEW.status = 'Active' THEN
        SELECT COUNT(*) INTO active_count
        FROM Subscriptions
        WHERE user_id = NEW.user_id 
          AND strategy_id = NEW.strategy_id 
          AND status = 'Active';

        IF active_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Duplicate active subscription not allowed.';
        END IF;
    END IF;

    -- Min capital check
    SELECT min_capital INTO strategy_min_capital
    FROM Strategies
    WHERE id = NEW.strategy_id;

    IF NEW.allocated_capital < strategy_min_capital THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Allocated capital is less than minimum capital.';
    END IF;

    -- Total capital check
    SELECT available_capital INTO user_avail_capital
    FROM Users
    WHERE id = NEW.user_id;

    SELECT IFNULL(SUM(allocated_capital),0) INTO current_allocated
    FROM Subscriptions
    WHERE user_id = NEW.user_id 
      AND status IN ('Active','Paused');

    IF (current_allocated + NEW.allocated_capital) > user_avail_capital THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Total allocated exceeds available capital.';
    END IF;

END$$

DELIMITER ;

--------------------------------------------------
-- SAMPLE DATA
--------------------------------------------------
INSERT INTO Users (name, available_capital) VALUES
('Alice Smith', 100000.00),
('Bob Jones', 50000.00);

INSERT INTO Strategies (name, category, risk_level, return_percentage, min_capital, is_active) VALUES
('Blue Chip Growth', 'Equity', 'Low', 8.5, 5000.00, 1),
('Tech Innovators', 'Equity', 'High', 15.0, 10000.00, 1),
('Global Bonds', 'Fixed Income', 'Low', 5.0, 1000.00, 1),
('Crypto Alpha', 'Digital Assets', 'High', 25.0, 2000.00, 1),
('Balanced Portfolio', 'Mixed', 'Medium', 10.0, 5000.00, 1);
