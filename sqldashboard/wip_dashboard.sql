-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: wip_dashboard
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `wip_aging_bucket`
--

DROP TABLE IF EXISTS `wip_aging_bucket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wip_aging_bucket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filter_type` varchar(50) DEFAULT NULL,
  `aging_bucket` varchar(50) DEFAULT NULL,
  `lot_count` int DEFAULT NULL,
  `record_date` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wip_aging_bucket`
--

LOCK TABLES `wip_aging_bucket` WRITE;
/*!40000 ALTER TABLE `wip_aging_bucket` DISABLE KEYS */;
INSERT INTO `wip_aging_bucket` VALUES (1,'InProgress','1-3',70,'2026-04-06'),(2,'InProgress','4-7',65,'2026-04-06'),(3,'InProgress','1-3',30,'2026-04-01'),(4,'InProgress','4-7',82,'2026-04-01'),(5,'InProgress','8-11',40,'2026-04-01'),(6,'InProgress','12-15',71,'2026-04-01'),(7,'InProgress','16-19',31,'2026-04-01'),(8,'InProgress','20-23',57,'2026-04-01'),(9,'InProgress','24-27',85,'2026-04-01'),(10,'InProgress','1-3',48,'2026-04-02'),(11,'InProgress','4-7',56,'2026-04-02'),(12,'InProgress','8-11',13,'2026-04-02'),(13,'InProgress','12-15',10,'2026-04-02'),(14,'InProgress','16-19',19,'2026-04-02'),(15,'InProgress','20-23',49,'2026-04-02'),(16,'InProgress','24-27',78,'2026-04-02'),(17,'InProgress','1-3',29,'2026-04-03'),(18,'InProgress','4-7',74,'2026-04-03'),(19,'InProgress','8-11',44,'2026-04-03'),(20,'InProgress','12-15',27,'2026-04-03'),(21,'InProgress','16-19',50,'2026-04-03'),(22,'InProgress','20-23',46,'2026-04-03'),(23,'InProgress','24-27',72,'2026-04-03'),(24,'InProgress','1-3',15,'2026-04-04'),(25,'InProgress','4-7',41,'2026-04-04'),(26,'InProgress','8-11',62,'2026-04-04'),(27,'InProgress','12-15',90,'2026-04-04'),(28,'InProgress','16-19',71,'2026-04-04'),(29,'InProgress','20-23',32,'2026-04-04'),(30,'InProgress','24-27',50,'2026-04-04'),(31,'InProgress','1-3',82,'2026-04-05'),(32,'InProgress','4-7',46,'2026-04-05'),(33,'InProgress','8-11',44,'2026-04-05'),(34,'InProgress','12-15',50,'2026-04-05'),(35,'InProgress','16-19',58,'2026-04-05'),(36,'InProgress','20-23',88,'2026-04-05'),(37,'InProgress','24-27',15,'2026-04-05'),(38,'InProgress','1-3',65,'2026-04-06'),(39,'InProgress','4-7',73,'2026-04-06'),(40,'InProgress','8-11',59,'2026-04-06'),(41,'InProgress','12-15',90,'2026-04-06'),(42,'InProgress','16-19',69,'2026-04-06'),(43,'InProgress','20-23',28,'2026-04-06'),(44,'InProgress','24-27',59,'2026-04-06'),(45,'InProgress','1-3',31,'2026-04-07'),(46,'InProgress','4-7',57,'2026-04-07'),(47,'InProgress','8-11',89,'2026-04-07'),(48,'InProgress','12-15',83,'2026-04-07'),(49,'InProgress','16-19',42,'2026-04-07'),(50,'InProgress','20-23',67,'2026-04-07'),(51,'InProgress','24-27',53,'2026-04-07'),(52,'InProgress','1-3',10,'2026-04-08'),(53,'InProgress','4-7',74,'2026-04-08'),(54,'InProgress','8-11',71,'2026-04-08'),(55,'InProgress','12-15',87,'2026-04-08'),(56,'InProgress','16-19',72,'2026-04-08'),(57,'InProgress','20-23',10,'2026-04-08'),(58,'InProgress','24-27',41,'2026-04-08'),(59,'InProgress','1-3',82,'2026-04-09'),(60,'InProgress','4-7',77,'2026-04-09'),(61,'InProgress','8-11',29,'2026-04-09'),(62,'InProgress','12-15',69,'2026-04-09'),(63,'InProgress','16-19',80,'2026-04-09'),(64,'InProgress','20-23',18,'2026-04-09'),(65,'InProgress','24-27',85,'2026-04-09'),(66,'InProgress','1-3',14,'2026-04-10'),(67,'InProgress','4-7',78,'2026-04-10'),(68,'InProgress','8-11',72,'2026-04-10'),(69,'InProgress','12-15',61,'2026-04-10'),(70,'InProgress','16-19',43,'2026-04-10'),(71,'InProgress','20-23',66,'2026-04-10'),(72,'InProgress','24-27',32,'2026-04-10');
/*!40000 ALTER TABLE `wip_aging_bucket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wip_defect_rate`
--

DROP TABLE IF EXISTS `wip_defect_rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wip_defect_rate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filter_type` varchar(50) DEFAULT NULL,
  `defect_code` varchar(50) DEFAULT NULL,
  `defect_count` int DEFAULT NULL,
  `total_defect_percentage` float DEFAULT NULL,
  `record_date` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wip_defect_rate`
--

LOCK TABLES `wip_defect_rate` WRITE;
/*!40000 ALTER TABLE `wip_defect_rate` DISABLE KEYS */;
INSERT INTO `wip_defect_rate` VALUES (1,'today','Scratch',5,1.8,'2026-04-06'),(2,'today','Crack',3,1.2,'2026-04-06'),(3,'today','Scratch',2,0.75,'2026-04-01'),(4,'today','Crack',5,1.23,'2026-04-01'),(5,'today','Discolor',5,1.42,'2026-04-01'),(6,'7days','Scratch',13,2.97,'2026-04-01'),(7,'7days','Crack',18,2.21,'2026-04-01'),(8,'7days','Discolor',8,1.85,'2026-04-01'),(9,'7days','Burr',9,1.86,'2026-04-01'),(10,'30days','Scratch',38,4.74,'2026-04-01'),(11,'30days','Crack',37,5.2,'2026-04-01'),(12,'30days','Discolor',13,1.56,'2026-04-01'),(13,'30days','Burr',15,1.86,'2026-04-01'),(14,'30days','Warp',31,2.55,'2026-04-01'),(15,'today','Scratch',3,1.39,'2026-04-02'),(16,'today','Crack',6,1.71,'2026-04-02'),(17,'today','Discolor',4,1.19,'2026-04-02'),(18,'7days','Scratch',18,2.99,'2026-04-02'),(19,'7days','Crack',16,2.37,'2026-04-02'),(20,'7days','Discolor',7,3.68,'2026-04-02'),(21,'7days','Burr',16,2.17,'2026-04-02'),(22,'30days','Scratch',23,5.32,'2026-04-02'),(23,'30days','Crack',21,4.65,'2026-04-02'),(24,'30days','Discolor',44,4.66,'2026-04-02'),(25,'30days','Burr',14,5.87,'2026-04-02'),(26,'30days','Warp',17,2.94,'2026-04-02'),(27,'today','Scratch',8,1.57,'2026-04-03'),(28,'today','Crack',4,1.31,'2026-04-03'),(29,'today','Discolor',4,0.8,'2026-04-03'),(30,'7days','Scratch',20,2.49,'2026-04-03'),(31,'7days','Crack',5,3.37,'2026-04-03'),(32,'7days','Discolor',7,1.24,'2026-04-03'),(33,'7days','Burr',18,3.61,'2026-04-03'),(34,'30days','Scratch',26,3.02,'2026-04-03'),(35,'30days','Crack',32,5.85,'2026-04-03'),(36,'30days','Discolor',36,3.31,'2026-04-03'),(37,'30days','Burr',15,2.02,'2026-04-03'),(38,'30days','Warp',17,5.04,'2026-04-03'),(39,'today','Scratch',3,0.47,'2026-04-04'),(40,'today','Crack',6,0.45,'2026-04-04'),(41,'today','Discolor',1,0.47,'2026-04-04'),(42,'7days','Scratch',17,3.24,'2026-04-04'),(43,'7days','Crack',13,3.68,'2026-04-04'),(44,'7days','Discolor',11,1.2,'2026-04-04'),(45,'7days','Burr',15,1.15,'2026-04-04'),(46,'30days','Scratch',37,1.91,'2026-04-04'),(47,'30days','Crack',41,1.96,'2026-04-04'),(48,'30days','Discolor',18,3.17,'2026-04-04'),(49,'30days','Burr',12,1.96,'2026-04-04'),(50,'30days','Warp',42,3.25,'2026-04-04'),(51,'today','Scratch',8,0.95,'2026-04-05'),(52,'today','Crack',1,1.64,'2026-04-05'),(53,'today','Discolor',5,0.97,'2026-04-05'),(54,'7days','Scratch',8,1.27,'2026-04-05'),(55,'7days','Crack',13,2.8,'2026-04-05'),(56,'7days','Discolor',18,3.22,'2026-04-05'),(57,'7days','Burr',6,1.67,'2026-04-05'),(58,'30days','Scratch',44,5.41,'2026-04-05'),(59,'30days','Crack',29,2.15,'2026-04-05'),(60,'30days','Discolor',23,2.16,'2026-04-05'),(61,'30days','Burr',17,3.38,'2026-04-05'),(62,'30days','Warp',34,3.78,'2026-04-05'),(63,'today','Scratch',1,1.84,'2026-04-06'),(64,'today','Crack',5,0.96,'2026-04-06'),(65,'today','Discolor',2,1.9,'2026-04-06'),(66,'7days','Scratch',5,3.1,'2026-04-06'),(67,'7days','Crack',6,2.72,'2026-04-06'),(68,'7days','Discolor',13,2.56,'2026-04-06'),(69,'7days','Burr',14,2.99,'2026-04-06'),(70,'30days','Scratch',17,3.19,'2026-04-06'),(71,'30days','Crack',34,2.49,'2026-04-06'),(72,'30days','Discolor',16,3.32,'2026-04-06'),(73,'30days','Burr',35,3.87,'2026-04-06'),(74,'30days','Warp',25,2.29,'2026-04-06'),(75,'today','Scratch',4,1.06,'2026-04-07'),(76,'today','Crack',5,1.3,'2026-04-07'),(77,'today','Discolor',5,1.52,'2026-04-07'),(78,'7days','Scratch',15,2.97,'2026-04-07'),(79,'7days','Crack',19,2.34,'2026-04-07'),(80,'7days','Discolor',11,2.28,'2026-04-07'),(81,'7days','Burr',16,1.06,'2026-04-07'),(82,'30days','Scratch',33,5.48,'2026-04-07'),(83,'30days','Crack',13,3.44,'2026-04-07'),(84,'30days','Discolor',25,4.31,'2026-04-07'),(85,'30days','Burr',22,2.07,'2026-04-07'),(86,'30days','Warp',45,5.21,'2026-04-07'),(87,'today','Scratch',3,1.86,'2026-04-08'),(88,'today','Crack',1,0.71,'2026-04-08'),(89,'today','Discolor',8,0.57,'2026-04-08'),(90,'7days','Scratch',6,2.64,'2026-04-08'),(91,'7days','Crack',20,2.8,'2026-04-08'),(92,'7days','Discolor',13,1.28,'2026-04-08'),(93,'7days','Burr',10,1.87,'2026-04-08'),(94,'30days','Scratch',29,5.97,'2026-04-08'),(95,'30days','Crack',17,1.54,'2026-04-08'),(96,'30days','Discolor',24,5.9,'2026-04-08'),(97,'30days','Burr',42,5.85,'2026-04-08'),(98,'30days','Warp',22,2.83,'2026-04-08'),(99,'today','Scratch',3,1.81,'2026-04-09'),(100,'today','Crack',6,0.4,'2026-04-09'),(101,'today','Discolor',5,1.55,'2026-04-09'),(102,'7days','Scratch',6,2.37,'2026-04-09'),(103,'7days','Crack',5,1.75,'2026-04-09'),(104,'7days','Discolor',13,3.35,'2026-04-09'),(105,'7days','Burr',20,3.76,'2026-04-09'),(106,'30days','Scratch',41,3.13,'2026-04-09'),(107,'30days','Crack',24,1.88,'2026-04-09'),(108,'30days','Discolor',16,2.94,'2026-04-09'),(109,'30days','Burr',37,2.02,'2026-04-09'),(110,'30days','Warp',25,3.66,'2026-04-09'),(111,'today','Scratch',7,1.15,'2026-04-10'),(112,'today','Crack',5,1.77,'2026-04-10'),(113,'today','Discolor',1,0.92,'2026-04-10'),(114,'7days','Scratch',17,2.68,'2026-04-10'),(115,'7days','Crack',5,2.32,'2026-04-10'),(116,'7days','Discolor',5,1.19,'2026-04-10'),(117,'7days','Burr',15,1.75,'2026-04-10'),(118,'30days','Scratch',45,2.78,'2026-04-10'),(119,'30days','Crack',13,5.92,'2026-04-10'),(120,'30days','Discolor',21,4.26,'2026-04-10'),(121,'30days','Burr',15,2.73,'2026-04-10'),(122,'30days','Warp',12,1.83,'2026-04-10');
/*!40000 ALTER TABLE `wip_defect_rate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wip_lot_status`
--

DROP TABLE IF EXISTS `wip_lot_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wip_lot_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filter_type` varchar(50) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `week_start_date` datetime DEFAULT NULL,
  `month_start_date` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `lot_count` int DEFAULT NULL,
  `record_date` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wip_lot_status`
--

LOCK TABLES `wip_lot_status` WRITE;
/*!40000 ALTER TABLE `wip_lot_status` DISABLE KEYS */;
INSERT INTO `wip_lot_status` VALUES (1,'today','2026-04-06 13:12:06','2026-04-06 13:12:06','2026-04-06 13:12:06','NotStarted',10,'2026-04-06'),(2,'today','2026-04-06 13:12:06','2026-04-06 13:12:06','2026-04-06 13:12:06','WorkInProcess',22,'2026-04-06'),(3,'today','2026-04-06 13:12:06','2026-04-06 13:12:06','2026-04-06 13:12:06','Finished',15,'2026-04-06'),(4,'today','2026-04-06 13:12:06','2026-04-06 13:12:06','2026-04-06 13:12:06','Hold',4,'2026-04-06'),(5,'today','2026-04-06 13:12:06','2026-04-06 13:12:06','2026-04-06 13:12:06','Cancelled',2,'2026-04-06'),(6,'today','2026-04-01 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','NotStarted',19,'2026-04-01'),(7,'today','2026-04-01 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','WorkInProcess',52,'2026-04-01'),(8,'today','2026-04-01 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Finished',32,'2026-04-01'),(9,'today','2026-04-01 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Hold',3,'2026-04-01'),(10,'today','2026-04-01 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Cancelled',2,'2026-04-01'),(11,'today','2026-04-02 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','NotStarted',10,'2026-04-02'),(12,'today','2026-04-02 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','WorkInProcess',49,'2026-04-02'),(13,'today','2026-04-02 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Finished',50,'2026-04-02'),(14,'today','2026-04-02 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Hold',1,'2026-04-02'),(15,'today','2026-04-02 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Cancelled',0,'2026-04-02'),(16,'today','2026-04-03 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','NotStarted',25,'2026-04-03'),(17,'today','2026-04-03 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','WorkInProcess',22,'2026-04-03'),(18,'today','2026-04-03 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Finished',24,'2026-04-03'),(19,'today','2026-04-03 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Hold',0,'2026-04-03'),(20,'today','2026-04-03 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Cancelled',4,'2026-04-03'),(21,'today','2026-04-04 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','NotStarted',10,'2026-04-04'),(22,'today','2026-04-04 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','WorkInProcess',37,'2026-04-04'),(23,'today','2026-04-04 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Finished',18,'2026-04-04'),(24,'today','2026-04-04 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Hold',4,'2026-04-04'),(25,'today','2026-04-04 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Cancelled',0,'2026-04-04'),(26,'today','2026-04-05 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','NotStarted',15,'2026-04-05'),(27,'today','2026-04-05 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','WorkInProcess',41,'2026-04-05'),(28,'today','2026-04-05 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Finished',33,'2026-04-05'),(29,'today','2026-04-05 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Hold',4,'2026-04-05'),(30,'today','2026-04-05 00:00:00','2026-03-30 00:00:00','2026-04-01 00:00:00','Cancelled',0,'2026-04-05'),(31,'today','2026-04-06 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','NotStarted',12,'2026-04-06'),(32,'today','2026-04-06 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','WorkInProcess',45,'2026-04-06'),(33,'today','2026-04-06 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Finished',49,'2026-04-06'),(34,'today','2026-04-06 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Hold',0,'2026-04-06'),(35,'today','2026-04-06 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Cancelled',2,'2026-04-06'),(36,'today','2026-04-07 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','NotStarted',15,'2026-04-07'),(37,'today','2026-04-07 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','WorkInProcess',48,'2026-04-07'),(38,'today','2026-04-07 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Finished',17,'2026-04-07'),(39,'today','2026-04-07 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Hold',7,'2026-04-07'),(40,'today','2026-04-07 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Cancelled',0,'2026-04-07'),(41,'today','2026-04-08 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','NotStarted',11,'2026-04-08'),(42,'today','2026-04-08 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','WorkInProcess',59,'2026-04-08'),(43,'today','2026-04-08 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Finished',12,'2026-04-08'),(44,'today','2026-04-08 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Hold',2,'2026-04-08'),(45,'today','2026-04-08 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Cancelled',3,'2026-04-08'),(46,'today','2026-04-09 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','NotStarted',6,'2026-04-09'),(47,'today','2026-04-09 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','WorkInProcess',56,'2026-04-09'),(48,'today','2026-04-09 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Finished',18,'2026-04-09'),(49,'today','2026-04-09 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Hold',7,'2026-04-09'),(50,'today','2026-04-09 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Cancelled',0,'2026-04-09'),(51,'today','2026-04-10 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','NotStarted',21,'2026-04-10'),(52,'today','2026-04-10 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','WorkInProcess',36,'2026-04-10'),(53,'today','2026-04-10 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Finished',50,'2026-04-10'),(54,'today','2026-04-10 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Hold',7,'2026-04-10'),(55,'today','2026-04-10 00:00:00','2026-04-06 00:00:00','2026-04-01 00:00:00','Cancelled',0,'2026-04-10');
/*!40000 ALTER TABLE `wip_lot_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wip_production_status`
--

DROP TABLE IF EXISTS `wip_production_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wip_production_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `record_date` date NOT NULL,
  `pending_count` int NOT NULL,
  `in_process_count` int NOT NULL,
  `hold_count` int NOT NULL,
  `cancelled_count` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wip_production_status`
--

LOCK TABLES `wip_production_status` WRITE;
/*!40000 ALTER TABLE `wip_production_status` DISABLE KEYS */;
INSERT INTO `wip_production_status` VALUES (1,'2026-04-01',22,51,7,5,'2026-04-01 00:00:00'),(2,'2026-04-02',22,29,6,5,'2026-04-02 00:00:00'),(3,'2026-04-03',25,56,3,2,'2026-04-03 00:00:00'),(4,'2026-04-04',13,33,7,2,'2026-04-04 00:00:00'),(5,'2026-04-05',29,42,3,4,'2026-04-05 00:00:00'),(6,'2026-04-06',9,44,3,2,'2026-04-06 00:00:00'),(7,'2026-04-07',29,32,2,4,'2026-04-07 00:00:00'),(8,'2026-04-08',5,49,10,1,'2026-04-08 00:00:00'),(9,'2026-04-09',12,26,1,4,'2026-04-09 00:00:00'),(10,'2026-04-10',27,17,2,3,'2026-04-10 00:00:00');
/*!40000 ALTER TABLE `wip_production_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wip_rework_rate`
--

DROP TABLE IF EXISTS `wip_rework_rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wip_rework_rate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filter_type` varchar(50) DEFAULT NULL,
  `rework` float DEFAULT NULL,
  `wip` int DEFAULT NULL,
  `record_date` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wip_rework_rate`
--

LOCK TABLES `wip_rework_rate` WRITE;
/*!40000 ALTER TABLE `wip_rework_rate` DISABLE KEYS */;
INSERT INTO `wip_rework_rate` VALUES (1,'today',2.4,120,'2026-04-06'),(2,'today',2.04,170,'2026-04-01'),(3,'7days',4.74,293,'2026-04-01'),(4,'30days',7.2,915,'2026-04-01'),(5,'today',3.09,84,'2026-04-02'),(6,'7days',6.02,289,'2026-04-02'),(7,'30days',6.85,735,'2026-04-02'),(8,'today',3.42,173,'2026-04-03'),(9,'7days',4.21,346,'2026-04-03'),(10,'30days',8.54,730,'2026-04-03'),(11,'today',1.02,166,'2026-04-04'),(12,'7days',5.8,265,'2026-04-04'),(13,'30days',8.68,728,'2026-04-04'),(14,'today',3.59,80,'2026-04-05'),(15,'7days',5.17,324,'2026-04-05'),(16,'30days',8.66,761,'2026-04-05'),(17,'today',3.01,82,'2026-04-06'),(18,'7days',4.62,265,'2026-04-06'),(19,'30days',5.65,924,'2026-04-06'),(20,'today',2.68,136,'2026-04-07'),(21,'7days',4.99,279,'2026-04-07'),(22,'30days',5.7,866,'2026-04-07'),(23,'today',1.52,126,'2026-04-08'),(24,'7days',4.13,287,'2026-04-08'),(25,'30days',6.41,702,'2026-04-08'),(26,'today',3.15,102,'2026-04-09'),(27,'7days',3.89,446,'2026-04-09'),(28,'30days',7.68,864,'2026-04-09'),(29,'today',1.5,148,'2026-04-10'),(30,'7days',4.1,377,'2026-04-10'),(31,'30days',6.78,939,'2026-04-10');
/*!40000 ALTER TABLE `wip_rework_rate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wip_scrap_rate`
--

DROP TABLE IF EXISTS `wip_scrap_rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wip_scrap_rate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filter_type` varchar(50) DEFAULT NULL,
  `scrap` float DEFAULT NULL,
  `wip_count` int DEFAULT NULL,
  `record_date` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wip_scrap_rate`
--

LOCK TABLES `wip_scrap_rate` WRITE;
/*!40000 ALTER TABLE `wip_scrap_rate` DISABLE KEYS */;
INSERT INTO `wip_scrap_rate` VALUES (1,'7days',4.2,120,'2026-04-06'),(2,'30days',6.8,340,'2026-04-06'),(3,'90days',9.5,920,'2026-04-06'),(4,'7days',5.01,109,'2026-04-01'),(5,'30days',4.9,292,'2026-04-01'),(6,'90days',10.36,730,'2026-04-01'),(7,'7days',2.24,146,'2026-04-02'),(8,'30days',3.4,404,'2026-04-02'),(9,'90days',11.34,873,'2026-04-02'),(10,'7days',3.53,161,'2026-04-03'),(11,'30days',3.2,205,'2026-04-03'),(12,'90days',9.61,521,'2026-04-03'),(13,'7days',3.14,86,'2026-04-04'),(14,'30days',6.47,356,'2026-04-04'),(15,'90days',6.38,743,'2026-04-04'),(16,'7days',3.27,180,'2026-04-05'),(17,'30days',7.27,252,'2026-04-05'),(18,'90days',9.83,943,'2026-04-05'),(19,'7days',3.56,86,'2026-04-06'),(20,'30days',7.26,437,'2026-04-06'),(21,'90days',9.19,628,'2026-04-06'),(22,'7days',2.29,131,'2026-04-07'),(23,'30days',6.9,295,'2026-04-07'),(24,'90days',7.04,732,'2026-04-07'),(25,'7days',4.43,95,'2026-04-08'),(26,'30days',5.46,316,'2026-04-08'),(27,'90days',11.04,807,'2026-04-08'),(28,'7days',4.27,172,'2026-04-09'),(29,'30days',6.43,236,'2026-04-09'),(30,'90days',5.85,981,'2026-04-09'),(31,'7days',2.13,105,'2026-04-10'),(32,'30days',4.9,395,'2026-04-10'),(33,'90days',5.14,631,'2026-04-10');
/*!40000 ALTER TABLE `wip_scrap_rate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wip_yield_summary`
--

DROP TABLE IF EXISTS `wip_yield_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wip_yield_summary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filter_type` varchar(50) DEFAULT NULL,
  `lot_action_type` varchar(50) DEFAULT NULL,
  `production_line_code` varchar(50) DEFAULT NULL,
  `total_yield` int DEFAULT NULL,
  `record_date` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wip_yield_summary`
--

LOCK TABLES `wip_yield_summary` WRITE;
/*!40000 ALTER TABLE `wip_yield_summary` DISABLE KEYS */;
INSERT INTO `wip_yield_summary` VALUES (1,'today','Completed','Line A',72,'2026-04-06'),(2,'today','Completed','Line A',40,'2026-04-01'),(3,'today','Completed','Line B',91,'2026-04-01'),(4,'today','Completed','Line C',58,'2026-04-01'),(5,'today','Completed','Line D',50,'2026-04-01'),(6,'today','Completed','Line E',51,'2026-04-01'),(7,'weeks','Completed','Line A',59,'2026-04-01'),(8,'weeks','Completed','Line B',52,'2026-04-01'),(9,'weeks','Completed','Line C',82,'2026-04-01'),(10,'weeks','Completed','Line D',59,'2026-04-01'),(11,'weeks','Completed','Line E',50,'2026-04-01'),(12,'months','Completed','Line A',92,'2026-04-01'),(13,'months','Completed','Line B',68,'2026-04-01'),(14,'months','Completed','Line C',80,'2026-04-01'),(15,'months','Completed','Line D',69,'2026-04-01'),(16,'months','Completed','Line E',81,'2026-04-01'),(17,'today','Completed','Line A',47,'2026-04-02'),(18,'today','Completed','Line B',67,'2026-04-02'),(19,'today','Completed','Line C',52,'2026-04-02'),(20,'today','Completed','Line D',76,'2026-04-02'),(21,'today','Completed','Line E',94,'2026-04-02'),(22,'weeks','Completed','Line A',54,'2026-04-02'),(23,'weeks','Completed','Line B',87,'2026-04-02'),(24,'weeks','Completed','Line C',73,'2026-04-02'),(25,'weeks','Completed','Line D',64,'2026-04-02'),(26,'weeks','Completed','Line E',62,'2026-04-02'),(27,'months','Completed','Line A',77,'2026-04-02'),(28,'months','Completed','Line B',61,'2026-04-02'),(29,'months','Completed','Line C',88,'2026-04-02'),(30,'months','Completed','Line D',55,'2026-04-02'),(31,'months','Completed','Line E',98,'2026-04-02'),(32,'today','Completed','Line A',51,'2026-04-03'),(33,'today','Completed','Line B',80,'2026-04-03'),(34,'today','Completed','Line C',48,'2026-04-03'),(35,'today','Completed','Line D',49,'2026-04-03'),(36,'today','Completed','Line E',40,'2026-04-03'),(37,'weeks','Completed','Line A',76,'2026-04-03'),(38,'weeks','Completed','Line B',56,'2026-04-03'),(39,'weeks','Completed','Line C',70,'2026-04-03'),(40,'weeks','Completed','Line D',65,'2026-04-03'),(41,'weeks','Completed','Line E',64,'2026-04-03'),(42,'months','Completed','Line A',66,'2026-04-03'),(43,'months','Completed','Line B',85,'2026-04-03'),(44,'months','Completed','Line C',71,'2026-04-03'),(45,'months','Completed','Line D',96,'2026-04-03'),(46,'months','Completed','Line E',96,'2026-04-03'),(47,'today','Completed','Line A',80,'2026-04-04'),(48,'today','Completed','Line B',95,'2026-04-04'),(49,'today','Completed','Line C',60,'2026-04-04'),(50,'today','Completed','Line D',50,'2026-04-04'),(51,'today','Completed','Line E',75,'2026-04-04'),(52,'weeks','Completed','Line A',90,'2026-04-04'),(53,'weeks','Completed','Line B',72,'2026-04-04'),(54,'weeks','Completed','Line C',78,'2026-04-04'),(55,'weeks','Completed','Line D',79,'2026-04-04'),(56,'weeks','Completed','Line E',53,'2026-04-04'),(57,'months','Completed','Line A',83,'2026-04-04'),(58,'months','Completed','Line B',78,'2026-04-04'),(59,'months','Completed','Line C',95,'2026-04-04'),(60,'months','Completed','Line D',88,'2026-04-04'),(61,'months','Completed','Line E',83,'2026-04-04'),(62,'today','Completed','Line A',76,'2026-04-05'),(63,'today','Completed','Line B',66,'2026-04-05'),(64,'today','Completed','Line C',52,'2026-04-05'),(65,'today','Completed','Line D',92,'2026-04-05'),(66,'today','Completed','Line E',90,'2026-04-05'),(67,'weeks','Completed','Line A',74,'2026-04-05'),(68,'weeks','Completed','Line B',76,'2026-04-05'),(69,'weeks','Completed','Line C',90,'2026-04-05'),(70,'weeks','Completed','Line D',66,'2026-04-05'),(71,'weeks','Completed','Line E',56,'2026-04-05'),(72,'months','Completed','Line A',95,'2026-04-05'),(73,'months','Completed','Line B',61,'2026-04-05'),(74,'months','Completed','Line C',67,'2026-04-05'),(75,'months','Completed','Line D',86,'2026-04-05'),(76,'months','Completed','Line E',85,'2026-04-05'),(77,'today','Completed','Line A',50,'2026-04-06'),(78,'today','Completed','Line B',74,'2026-04-06'),(79,'today','Completed','Line C',90,'2026-04-06'),(80,'today','Completed','Line D',68,'2026-04-06'),(81,'today','Completed','Line E',85,'2026-04-06'),(82,'weeks','Completed','Line A',60,'2026-04-06'),(83,'weeks','Completed','Line B',95,'2026-04-06'),(84,'weeks','Completed','Line C',50,'2026-04-06'),(85,'weeks','Completed','Line D',74,'2026-04-06'),(86,'weeks','Completed','Line E',91,'2026-04-06'),(87,'months','Completed','Line A',61,'2026-04-06'),(88,'months','Completed','Line B',93,'2026-04-06'),(89,'months','Completed','Line C',81,'2026-04-06'),(90,'months','Completed','Line D',67,'2026-04-06'),(91,'months','Completed','Line E',86,'2026-04-06'),(92,'today','Completed','Line A',43,'2026-04-07'),(93,'today','Completed','Line B',92,'2026-04-07'),(94,'today','Completed','Line C',46,'2026-04-07'),(95,'today','Completed','Line D',56,'2026-04-07'),(96,'today','Completed','Line E',65,'2026-04-07'),(97,'weeks','Completed','Line A',86,'2026-04-07'),(98,'weeks','Completed','Line B',87,'2026-04-07'),(99,'weeks','Completed','Line C',63,'2026-04-07'),(100,'weeks','Completed','Line D',61,'2026-04-07'),(101,'weeks','Completed','Line E',85,'2026-04-07'),(102,'months','Completed','Line A',84,'2026-04-07'),(103,'months','Completed','Line B',71,'2026-04-07'),(104,'months','Completed','Line C',75,'2026-04-07'),(105,'months','Completed','Line D',93,'2026-04-07'),(106,'months','Completed','Line E',84,'2026-04-07'),(107,'today','Completed','Line A',70,'2026-04-08'),(108,'today','Completed','Line B',53,'2026-04-08'),(109,'today','Completed','Line C',89,'2026-04-08'),(110,'today','Completed','Line D',53,'2026-04-08'),(111,'today','Completed','Line E',61,'2026-04-08'),(112,'weeks','Completed','Line A',91,'2026-04-08'),(113,'weeks','Completed','Line B',50,'2026-04-08'),(114,'weeks','Completed','Line C',75,'2026-04-08'),(115,'weeks','Completed','Line D',73,'2026-04-08'),(116,'weeks','Completed','Line E',88,'2026-04-08'),(117,'months','Completed','Line A',97,'2026-04-08'),(118,'months','Completed','Line B',71,'2026-04-08'),(119,'months','Completed','Line C',91,'2026-04-08'),(120,'months','Completed','Line D',91,'2026-04-08'),(121,'months','Completed','Line E',84,'2026-04-08'),(122,'today','Completed','Line A',60,'2026-04-09'),(123,'today','Completed','Line B',88,'2026-04-09'),(124,'today','Completed','Line C',40,'2026-04-09'),(125,'today','Completed','Line D',70,'2026-04-09'),(126,'today','Completed','Line E',54,'2026-04-09'),(127,'weeks','Completed','Line A',67,'2026-04-09'),(128,'weeks','Completed','Line B',79,'2026-04-09'),(129,'weeks','Completed','Line C',95,'2026-04-09'),(130,'weeks','Completed','Line D',56,'2026-04-09'),(131,'weeks','Completed','Line E',88,'2026-04-09'),(132,'months','Completed','Line A',91,'2026-04-09'),(133,'months','Completed','Line B',72,'2026-04-09'),(134,'months','Completed','Line C',74,'2026-04-09'),(135,'months','Completed','Line D',80,'2026-04-09'),(136,'months','Completed','Line E',75,'2026-04-09'),(137,'today','Completed','Line A',83,'2026-04-10'),(138,'today','Completed','Line B',66,'2026-04-10'),(139,'today','Completed','Line C',64,'2026-04-10'),(140,'today','Completed','Line D',88,'2026-04-10'),(141,'today','Completed','Line E',41,'2026-04-10'),(142,'weeks','Completed','Line A',88,'2026-04-10'),(143,'weeks','Completed','Line B',85,'2026-04-10'),(144,'weeks','Completed','Line C',52,'2026-04-10'),(145,'weeks','Completed','Line D',97,'2026-04-10'),(146,'weeks','Completed','Line E',63,'2026-04-10'),(147,'months','Completed','Line A',95,'2026-04-10'),(148,'months','Completed','Line B',99,'2026-04-10'),(149,'months','Completed','Line C',58,'2026-04-10'),(150,'months','Completed','Line D',85,'2026-04-10'),(151,'months','Completed','Line E',83,'2026-04-10');
/*!40000 ALTER TABLE `wip_yield_summary` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-06 13:37:58
