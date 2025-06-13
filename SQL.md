


          
# 数字农场土壤质量监测系统数据库设计

## 数据库设计目标

1. 存储土壤基础指标和微量元素数据
2. 支持土壤基础指标和微量元素的新增、修改、删除和查询
3. 支持土壤质量评估的新增、修改、删除和查询
4. 支持预警记录的新增、修改、删除和查询
5. 支持用户管理，包括用户注册、登录、权限管理等功能


## 数据库表设计

### 1. 基地表 (Base)

```sql
CREATE TABLE Base (
    base_id INT PRIMARY KEY AUTO_INCREMENT,
    base_name VARCHAR(50) NOT NULL COMMENT '基地名称',
    location VARCHAR(100) COMMENT '基地位置',
    area DECIMAL(10,2) COMMENT '基地面积(亩)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);
```

### 2. 监测点表 (MonitoringPoint)

```sql
CREATE TABLE MonitoringPoint (
    point_id INT PRIMARY KEY AUTO_INCREMENT,
    base_id INT NOT NULL COMMENT '所属基地ID',
    point_name VARCHAR(50) NOT NULL COMMENT '监测点名称',
    location VARCHAR(100) COMMENT '具体位置',
    image_url VARCHAR(255) COMMENT '监测点照片URL',
    longitude DECIMAL(10,6) COMMENT '经度',
    latitude DECIMAL(10,6) COMMENT '纬度',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (base_id) REFERENCES Base(base_id)
);
```

### 3. 土壤样本表 (SoilSample)

```sql
CREATE TABLE SoilSample (
    sample_id INT PRIMARY KEY AUTO_INCREMENT,
    point_id INT NOT NULL COMMENT '监测点ID',
    soil_sample_no VARCHAR(50) NOT NULL COMMENT '土样编号',
    soil_type VARCHAR(50) COMMENT '土样类型',
    sample_depth VARCHAR(20) COMMENT '采样深度(cm)',
    sample_date DATE NOT NULL COMMENT '采样日期',
    reporter VARCHAR(50) COMMENT '上报人',
    report_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上报时间',
    FOREIGN KEY (point_id) REFERENCES MonitoringPoint(point_id)
);
```

### 4. 土壤基础指标表 (SoilBasicIndicator)

```sql
CREATE TABLE SoilBasicIndicator (
    indicator_id INT PRIMARY KEY AUTO_INCREMENT,
    sample_id INT NOT NULL COMMENT '土样ID',
    ph DECIMAL(5,2) COMMENT 'pH值',
    water_content DECIMAL(5,2) COMMENT '水分含量(%ww/c)',
    conductivity DECIMAL(8,2) COMMENT '电导率(mS/cm)',
    organic_matter DECIMAL(8,2) COMMENT '有机质(g/kg)',
    available_p DECIMAL(8,2) COMMENT '有效磷(mg/kg)',
    available_k DECIMAL(8,2) COMMENT '速效钾(mg/kg)',
    available_n DECIMAL(8,2) COMMENT '有效氮(mg/kg)',
    FOREIGN KEY (sample_id) REFERENCES SoilSample(sample_id)
);
```

### 5. 土壤微量元素表 (SoilMicroElement)

```sql
CREATE TABLE SoilMicroElement (
    element_id INT PRIMARY KEY AUTO_INCREMENT,
    sample_id INT NOT NULL COMMENT '土样ID',
    element_type ENUM('铜','锌','铁','锰','硼','钼','氯','硅') NOT NULL COMMENT '元素类型',
    value DECIMAL(10,4) NOT NULL COMMENT '元素含量值',
    unit VARCHAR(20) COMMENT '单位',
    status VARCHAR(20) COMMENT '状态评价',
    trend VARCHAR(20) COMMENT '变化趋势',
    FOREIGN KEY (sample_id) REFERENCES SoilSample(sample_id)
);
```

### 6. 土壤质量评估表 (SoilQualityEvaluation)

```sql
CREATE TABLE SoilQualityEvaluation (
    evaluation_id INT PRIMARY KEY AUTO_INCREMENT,
    point_id INT NOT NULL COMMENT '监测点ID',
    quality_level INT NOT NULL COMMENT '耕地质量等级(1-15)',
    evaluation_date DATE NOT NULL COMMENT '评定日期',
    evaluator VARCHAR(50) COMMENT '评定人',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (point_id) REFERENCES MonitoringPoint(point_id)
);
```

### 7. 预警记录表 (AlertRecord)

```sql
CREATE TABLE AlertRecord (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    point_id INT NOT NULL COMMENT '监测点ID',
    alert_content TEXT NOT NULL COMMENT '预警内容',
    alert_time DATETIME NOT NULL COMMENT '预警时间',
    alert_level ENUM('info','warning','danger') DEFAULT 'info' COMMENT '预警级别',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    read_time DATETIME COMMENT '查看时间',
    FOREIGN KEY (point_id) REFERENCES MonitoringPoint(point_id)
);
```

### 8. 预警设置表 (AlertSettings)

```sql
CREATE TABLE AlertSettings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    indicator_name VARCHAR(50) NOT NULL COMMENT '指标名称',
    condition_type ENUM('大于', '小于', '等于', '分子之外') NOT NULL COMMENT '条件类型',
    threshold DECIMAL(10,2) NOT NULL COMMENT '阈值',
    decimal_places INT DEFAULT 0 COMMENT '精度',
    step DECIMAL(10,2) DEFAULT 1 COMMENT '步长',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_indicator (indicator_name)
);
```

### 9. 用户表 (User)

```sql
CREATE TABLE IF NOT EXISTS `User` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `real_name` VARCHAR(50),
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `avatar_url` VARCHAR(255),
  `gender` VARCHAR(10),
  `birthday` DATE,
  `department` VARCHAR(50),
  `position` VARCHAR(50),
  `phone` VARCHAR(20),
  `email` VARCHAR(100) UNIQUE,
  `address` VARCHAR(255),
  `bio` TEXT,
  `last_login` DATETIME,
  `login_ip` VARCHAR(50),
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_user_username ON `User` (`username`);
CREATE INDEX idx_user_email ON `User` (`email`);
CREATE INDEX idx_user_phone ON `User` (`phone`);
```

### 10. 土壤样本全表 (SoilSampleFull)
```SQL
CREATE TABLE SoilSampleFull (
    sample_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '样本ID，自增主键',

    -- 🌱 基础采样信息
    base_id INT NOT NULL COMMENT '所属基地ID',
    point_id INT NOT NULL COMMENT '所属监测点ID',
    soil_sample_no VARCHAR(50) NOT NULL COMMENT '土样编号',
    soil_type VARCHAR(50) COMMENT '土壤类型',
    soil_sample_name VARCHAR(50) COMMENT '土样名称',
    longitude DECIMAL(10,6) COMMENT '经度',
    latitude DECIMAL(10,6) COMMENT '纬度',
    sample_depth VARCHAR(20) COMMENT '采样深度(cm)',
    sample_date DATE NOT NULL COMMENT '采样日期',
    reporter VARCHAR(50) COMMENT '采样人',
    phone VARCHAR(20) COMMENT '联系电话',
    report_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报告时间',

    -- 🧪 基础理化指标
    ph DECIMAL(5,2) COMMENT 'pH值',
    organic_matter DECIMAL(10,2) COMMENT '有机质(g/kg)',
    water_content DECIMAL(10,2) COMMENT '水分含量(%WW/C)',
    available_p DECIMAL(10,2) COMMENT '有效磷(mg/kg)',
    available_k DECIMAL(10,2) COMMENT '速效钾(mg/kg)',
    available_n DECIMAL(10,2) COMMENT '有效氮(mg/kg)',
    conductivity DECIMAL(10,2) COMMENT '电导率(mS/cm)',

    -- 🌡 微量元素指标
    si_value DECIMAL(10,2) COMMENT '硅(mg/kg)',
    s_value DECIMAL(10,2) COMMENT '硫(mg/kg)',
    b_value DECIMAL(10,2) COMMENT '硼(mg/kg)',
    mo_value DECIMAL(10,2) COMMENT '钼(mg/kg)',
    cl_value DECIMAL(10,2) COMMENT '氯(mg/kg)',
    ca_value DECIMAL(10,2) COMMENT '钙(mg/kg)',
    mg_value DECIMAL(10,2) COMMENT '镁(mg/kg)',
    zn_value DECIMAL(10,2) COMMENT '锌(mg/kg)',
    cu_value DECIMAL(10,2) COMMENT '铜(mg/kg)',
    mn_value DECIMAL(10,2) COMMENT '锰(mg/kg)',
    fe_value DECIMAL(10,2) COMMENT '铁(mg/kg)',

    -- 数据来源
    data_source ENUM('device', 'manual') NOT NULL DEFAULT 'manual' COMMENT '数据来源：device-设备测量，manual-人工上报',

    -- 🕒 系统字段
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 🔍 索引建议
    INDEX idx_point (point_id),
    INDEX idx_sample_date (sample_date),
    INDEX idx_data_source (data_source),
    INDEX idx_base_point (base_id, point_id),

    FOREIGN KEY (base_id) REFERENCES Base(base_id),
    FOREIGN KEY (point_id) REFERENCES MonitoringPoint(point_id)
) COMMENT='土壤样本完整表，包含基础指标与微量元素';
```

### 11.角色变更请求表
```sql
CREATE TABLE role_change_request (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色变更请求ID，自增主键',
  user_id INT NOT NULL COMMENT '申请用户ID，关联user表',
  current_role VARCHAR(20) NOT NULL COMMENT '当前角色名称',
  requested_role VARCHAR(20) NOT NULL COMMENT '请求变更的角色名称',
  reason TEXT COMMENT '角色变更原因说明',
  status VARCHAR(20) DEFAULT 'PENDING' COMMENT '请求状态：PENDING, APPROVED, REJECTED',
  admin_id BIGINT COMMENT '审批管理员ID，关联user表',
  admin_comment TEXT COMMENT '管理员审批意见',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (admin_id) REFERENCES user(user_id)
) COMMENT='角色变更请求记录表';
```

## 用户头像存储方案(后面可以改成OSS)
对于用户头像的存储，有两种主要方案：

### 方案一：文件系统存储 + 数据库引用
1. 将头像图片存储在服务器文件系统的特定目录中
2. 在数据库中只存储图片的URL或相对路径
3. 可以按用户ID组织目录结构，如 /uploads/avatars/{user_id}/{filename}
优点 ：

- 数据库负担小，只存储路径信息
- 便于通过Web服务器直接访问图片
- 适合大量图片的存储和访问
缺点 ：

- 需要管理文件系统的存储空间
- 备份和迁移时需要同时处理数据库和文件系统

## 表关系说明

1. 一个基地(Base)可以有多个监测点(MonitoringPoint)
2. 一个监测点(MonitoringPoint)可以有多个土壤样本(SoilSample)
3. 一个土壤样本(SoilSample)对应一条基础指标记录(SoilBasicIndicator)
4. 一个土壤样本(SoilSample)可以有多条微量元素记录(SoilMicroElement)
5. 一个监测点(MonitoringPoint)可以有多条质量评估记录(SoilQualityEvaluation)
6. 一个监测点(MonitoringPoint)可以有多条预警记录(AlertRecord)

## 数据库设计考虑因素

1. **分表设计**：将土壤基础指标和微量元素分开存储，便于查询和管理不同类型的数据
2. **枚举类型**：对于固定选项的字段使用枚举类型，如元素类型、预警级别等
3. **外键关联**：通过外键建立表之间的关系，保证数据完整性
4. **时间戳**：添加创建时间和更新时间字段，便于数据追踪
5. **索引优化**：可以在查询频繁的字段上添加索引，如监测点名称、采样日期等

这个数据库设计涵盖了您系统中显示的所有主要功能，包括监测点管理、数据分析、质量评估和预警记录等。您可以根据实际需求进行调整和扩展。

        