CREATE DATABASE StrategyDB;
GO

USE StrategyDB;
GO

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    available_capital DECIMAL(18, 2) NOT NULL DEFAULT 0.00
);
GO

CREATE TABLE Strategies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    risk_level VARCHAR(10) CHECK (risk_level IN ('Low', 'Medium', 'High')) NOT NULL,
    return_percentage DECIMAL(5, 2) NOT NULL,
    min_capital DECIMAL(18, 2) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE Subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    strategy_id INT NOT NULL,
    allocated_capital DECIMAL(18, 2) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('Active', 'Paused', 'Cancelled')) NOT NULL DEFAULT 'Active',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (strategy_id) REFERENCES Strategies(id)
);
GO

--------------------------------------------------
-- TRIGGER: INSERT
--------------------------------------------------
CREATE TRIGGER trg_before_subscription_insert
ON Subscriptions
INSTEAD OF INSERT
AS
BEGIN
    DECLARE @user_id INT,
            @strategy_id INT,
            @allocated_capital DECIMAL(18,2),
            @status VARCHAR(10);

    SELECT 
        @user_id = user_id,
        @strategy_id = strategy_id,
        @allocated_capital = allocated_capital,
        @status = status
    FROM inserted;

    DECLARE @strategy_min_capital DECIMAL(18,2);
    DECLARE @user_avail_capital DECIMAL(18,2);
    DECLARE @current_allocated DECIMAL(18,2);
    DECLARE @active_count INT;

    -- Duplicate active check
    IF @status = 'Active'
    BEGIN
        SELECT @active_count = COUNT(*) 
        FROM Subscriptions 
        WHERE user_id = @user_id AND strategy_id = @strategy_id AND status = 'Active';

        IF @active_count > 0
        BEGIN
            RAISERROR ('Duplicate active subscription not allowed.', 16, 1);
            RETURN;
        END
    END

    -- Min capital check
    SELECT @strategy_min_capital = min_capital FROM Strategies WHERE id = @strategy_id;

    IF @allocated_capital < @strategy_min_capital
    BEGIN
        RAISERROR ('Allocated capital is less than minimum capital.', 16, 1);
        RETURN;
    END

    -- Total capital check
    SELECT @user_avail_capital = available_capital FROM Users WHERE id = @user_id;

    SELECT @current_allocated = ISNULL(SUM(allocated_capital), 0)
    FROM Subscriptions
    WHERE user_id = @user_id AND status IN ('Active','Paused');

    IF (@current_allocated + @allocated_capital) > @user_avail_capital
    BEGIN
        RAISERROR ('Total allocated exceeds available capital.', 16, 1);
        RETURN;
    END

    -- Insert if all valid
    INSERT INTO Subscriptions (user_id, strategy_id, allocated_capital, status)
    SELECT user_id, strategy_id, allocated_capital, status
    FROM inserted;
END;
GO

--------------------------------------------------
-- SAMPLE DATA
--------------------------------------------------
INSERT INTO Users (name, available_capital) VALUES
('Alice Smith', 100000.00),
('Bob Jones', 50000.00);
GO

INSERT INTO Strategies (name, category, risk_level, return_percentage, min_capital, is_active) VALUES
('Blue Chip Growth', 'Equity', 'Low', 8.5, 5000.00, 1),
('Tech Innovators', 'Equity', 'High', 15.0, 10000.00, 1),
('Global Bonds', 'Fixed Income', 'Low', 5.0, 1000.00, 1),
('Crypto Alpha', 'Digital Assets', 'High', 25.0, 2000.00, 1),
('Balanced Portfolio', 'Mixed', 'Medium', 10.0, 5000.00, 1);
GO