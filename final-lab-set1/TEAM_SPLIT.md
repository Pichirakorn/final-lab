# TEAM_SPLIT.md

## Team Members
- 67543210004-7 นายพิชิรกร ชาติปิระ
- 67543210041-9 นายพัชรพล สืบทายาท

## Work Allocation
### Student 1: นายพิชิรกร ชาติปิระ
- รับผิดชอบ Auth Service
- รับผิดชอบ Task Service
- รับผิดชอบ Log Service
- รับผิดชอบ JWT login flow
- รับผิดชอบ HTTPS certificate และ Nginx reverse proxy

### Student 2: นายพัชรพล สืบทายาท
- รับผิดชอบ Frontend และ Docker Compose integration
- Test Cases และ Screenshots
- รับผิดชอบ Auth Service บางส่วน
- จัดทำ README และ screenshots ร่วมกัน

## Shared Responsibilities
- ออกแบบ architecture diagram ร่วมกัน
- ทดสอบ end-to-end ร่วมกัน

## Reason for Work Split
ง่ายต่อการทำงานในรวดเดียวเพราะ นายพิชิรกร สามารถทำส่วนแรกได้หมดคนเดี่ยวโดยไม่ต้องลำบาก push ขึ้น git ให้ นายพัชรพล ทำต่อ
ดั่งนั้น นายพิชิรกร จึงทำทั้งหมดและให้ นายพัชรพล ทำ frontend และ run test ต่าง จะให้ นายพิชิรกร ทำส่วนแรกทั้งหมด แต่เขาก็ลืมใส่
ข้อมูลบางส่วนใน 

## Integration Notes
ระบบถูกออกแบบในรูปแบบ Microservices โดยแต่ละ service มีหน้าที่เฉพาะของตนเอง และสื่อสารกันผ่าน HTTP API ผ่าน Nginx reverse proxy

ลำดับการทำงานของระบบโดยรวมมีดังนี้

1. ผู้ใช้เข้าถึงระบบผ่าน Browser หรือ API Client โดยเชื่อมต่อผ่าน HTTPS ไปยัง Nginx
2. Nginx ทำหน้าที่เป็น Reverse Proxy และทำการส่ง request ไปยัง service ที่เกี่ยวข้อง
3. เมื่อผู้ใช้ทำการ Login Request จะถูกส่งไปยัง Auth Service
4. Auth Service จะตรวจสอบ email และ password กับฐานข้อมูล และหากถูกต้องจะสร้าง JWT Token ส่งกลับไปให้ผู้ใช้
5. ผู้ใช้จะต้องส่ง JWT Token นี้ใน Authorization Header (Bearer Token) ทุกครั้งที่เรียก API ที่ต้องการการยืนยันตัวตน
6. เมื่อผู้ใช้เรียก Task API เช่น การสร้างหรือดูรายการ Task Nginx จะส่ง request ไปยัง Task Service
7. Task Service จะตรวจสอบ JWT Token ก่อน หาก token ถูกต้องจึงจะอนุญาตให้เข้าถึงหรือแก้ไขข้อมูลในฐานข้อมูล Task
8. ในกรณีที่มีการเรียกดู Log ข้อมูลจะถูกส่งไปยัง Log Service ซึ่งอนุญาตให้เฉพาะผู้ใช้ที่มี role เป็น admin เท่านั้น
9. ทุก service ทำงานอยู่ใน Docker containers และเชื่อมต่อกันผ่าน Docker network ที่กำหนดใน docker-compose

ด้วยการแยก service แบบนี้ทำให้ระบบสามารถพัฒนา ทดสอบ และดูแลแต่ละส่วนได้อย่างอิสระ และช่วยให้โครงสร้างระบบมีความยืดหยุ่นและสามารถขยายต่อได้ในอนาคต
